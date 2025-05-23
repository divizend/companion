import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { apiDelete, apiGet, apiPatch, apiPost } from '@/common/api';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Button } from '@/components/base';
import ModalLayout from '@/components/global/ModalLayout';
import { useSnackbar } from '@/components/global/Snackbar';
import { showConfirm } from '@/components/global/prompt';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';

import { useWaitlistStatus } from './queries';
import ConfirmationStep from './steps/ConfirmationStep';
import ExplainerStep from './steps/ExplainerStep';
import JoinedWaitlistStep from './steps/JoinedWaitlistStep';
import SolidarityDisclaimerStep from './steps/SolidarityDisclaimerStep';
import SubscriptionOptions from './steps/SubscriptionOptions';
import { requiresWaitlist } from './util';

type Props = { dismiss: () => void; skipFirstStep?: boolean };

export interface IStepProps {
  setCanContinue: React.Dispatch<React.SetStateAction<boolean>>;
  canContinue: boolean;
}

enum SubscriptionStep {
  ExplainerStep = 0,
  ChoosePlanStep = 1,
  SolidarityDisclaimerStep = 2,
  FinalStep = 3,
}

export default function SubscriptionModal({ dismiss, skipFirstStep = false }: Props) {
  const { t } = useTranslation();
  const { loading, purchasePackages, setCustomerInfo, refreshCustomerInfo, customerInfo } = usePurchases();
  const { showSnackbar } = useSnackbar();
  const [modalWidth, setModalWidth] = useState(0);

  const theme = useThemeColor();

  const [currentPage, setCurrentPage] = useState<SubscriptionStep>(SubscriptionStep.ExplainerStep);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage>();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { data, isLoading, refetch } = useWaitlistStatus();
  // A flag used to know if a user has purchased a plan or he was added to the waiting list.
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (skipFirstStep && currentPage === SubscriptionStep.ExplainerStep && !!modalWidth) {
      setCanContinue(true);
      goToPage(SubscriptionStep.ChoosePlanStep);
    }
  }, [modalWidth]);

  const goToPage = (step: SubscriptionStep) =>
    setTimeout(
      () =>
        scrollViewRef.current?.scrollTo({
          x: modalWidth * step,
          animated: true,
        }),
      200,
    );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!canContinue) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = modalWidth ? Math.round(contentOffsetX / modalWidth) : 1;
    setCurrentPage(page as SubscriptionStep);
  };

  /**
   * Checks if the user has correct number of waiting list entries and attempts to reserve them.
   * If reservation is successful, the user can purchase otherwise redirect to last step.
   */

  if (loading || !purchasePackages || isLoading || !data) return <FullScreenActivityIndicator />;

  const awaitedPackage = !!data.waitingForPoints
    ? purchasePackages.find(purchasePackage => requiresWaitlist(purchasePackage) === data.waitingForPoints)
    : undefined;

  const checkPointsAndPurchase = async (purchasePackage: PurchasesPackage) => {
    const pointsRequired = requiresWaitlist(purchasePackage);
    const reservedPoints = await apiPost<boolean>('/sponsored-purchase/initialize', {
      points: pointsRequired,
    });
    const canPurchase = await apiGet(`/sponsored-purchase/can-purchase/${pointsRequired}`);
    if (!!reservedPoints || !!canPurchase) return await handleSubscribe(purchasePackage);
    else {
      refetch();
      goToPage(SubscriptionStep.FinalStep);
    }
  };

  const handleSubscribe = async (product: PurchasesPackage) => {
    await Purchases.purchasePackage(
      product,
      null,
      Platform.OS === 'android' &&
        customerInfo?.entitlements.active['divizend-membership'] &&
        customerInfo.entitlements.all['divizend-membership']?.store !== 'PROMOTIONAL'
        ? {
            oldProductIdentifier: customerInfo.entitlements.active['divizend-membership'].productIdentifier,
          }
        : null,
    )
      .then(async makePurchaseResult => {
        if (makePurchaseResult.customerInfo.entitlements.all['divizend-membership']?.store === 'PROMOTIONAL')
          // If a trial exists, revoke it so the user gets the right package displayed instead of the trial after purchase.
          await apiDelete('/revoke-trial').then(refreshCustomerInfo);
        else setCustomerInfo(makePurchaseResult.customerInfo);
        refetch();
        setHasSubscribed(true);
      })
      .then(() => goToPage(SubscriptionStep.FinalStep));
  };

  const attemptSubscribe = async (purchasePackage: PurchasesPackage) => {
    try {
      setIsSubscribing(true);
      const pointsRequired = requiresWaitlist(purchasePackage);

      // Handle non-sponsored options
      if (!pointsRequired) {
        if (!!awaitedPackage) {
          await showConfirm({
            title: t('subscription.choosePlan.alerts.title'),
            message: t('subscription.choosePlan.alerts.removed'),
          });
          // Abondon all spots if user chooses a non-sponsored option.
          await apiPatch('/sponsored-purchase/abandon-spots', { points: data.waitingForPoints });
          refetch();
        }
        await handleSubscribe(purchasePackage);
        return;
      }

      if (!awaitedPackage) return await checkPointsAndPurchase(purchasePackage);

      // Can purhcase only returns true when the spots were reserved on that call.
      if (pointsRequired > data.waitingForPoints) {
        await showConfirm({
          title: t('subscription.choosePlan.alerts.title'),
          message: t('subscription.choosePlan.alerts.bottomWaitlist'),
        });
        await apiPatch('/sponsored-purchase/abandon-spots', { points: data.waitingForPoints });
        await checkPointsAndPurchase(purchasePackage);

        // try to subscribe i guess or not.
      } else if (pointsRequired < data.waitingForPoints) {
        await showConfirm({
          title: t('subscription.choosePlan.alerts.title'),
          message: t('subscription.choosePlan.alerts.losePosition'),
        });
        await apiPatch('/sponsored-purchase/abandon-spots', { points: data.waitingForPoints - pointsRequired });
        // Try to buy
        await checkPointsAndPurchase(purchasePackage);
      } else if (pointsRequired === data.waitingForPoints) await checkPointsAndPurchase(purchasePackage);
    } catch (error: any) {
      console.log(error);
      showSnackbar(error.message, { type: 'error' });
      refetch();
      dismiss();
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleNextStep = async () => {
    switch (currentPage) {
      case SubscriptionStep.ExplainerStep:
        goToPage(SubscriptionStep.ChoosePlanStep);

        break;
      case SubscriptionStep.ChoosePlanStep: {
        if (!selectedPackage) break;
        if (selectedPackage?.identifier === purchasePackages[2].identifier) await attemptSubscribe(selectedPackage);
        else goToPage(SubscriptionStep.SolidarityDisclaimerStep);

        break;
      }

      case SubscriptionStep.SolidarityDisclaimerStep: {
        if (selectedPackage && selectedPackage.identifier !== purchasePackages[2].identifier)
          await attemptSubscribe(selectedPackage);
        break;
      }

      default:
        dismiss();
        break;
    }
  };

  let buttonText = t('subscription.choosePlan.button.continue');
  switch (currentPage) {
    case SubscriptionStep.ExplainerStep: {
      buttonText = t('subscription.choosePlan.button.getStarted');
      break;
    }
    case SubscriptionStep.FinalStep: {
      buttonText = t('subscription.choosePlan.button.finalize');
      break;
    }

    default:
      break;
  }

  return (
    <ModalLayout noScrollView title={t('subscription.choosePlan.title')} dismiss={dismiss}>
      <View onLayout={e => setModalWidth(e.nativeEvent.layout.width)} className="flex-1 justify-center items-center">
        {!!modalWidth && (
          <>
            <ScrollView
              scrollEnabled={false}
              ref={scrollViewRef}
              showsHorizontalScrollIndicator={false}
              horizontal
              pagingEnabled
              onScroll={handleScroll}
            >
              <View style={{ width: modalWidth }}>
                <ExplainerStep setCanContinue={setCanContinue} canContinue={canContinue} />
              </View>
              <View style={{ width: modalWidth }}>
                <SubscriptionOptions
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                  awaitedPackage={awaitedPackage}
                />
              </View>
              <View style={{ width: modalWidth }}>
                <SolidarityDisclaimerStep canContinue={canContinue} setCanContinue={setCanContinue} />
              </View>
              <View style={{ width: modalWidth }}>{hasSubscribed ? <ConfirmationStep /> : <JoinedWaitlistStep />}</View>
            </ScrollView>
            <Button
              loading={isSubscribing}
              onPress={handleNextStep}
              disabled={
                !canContinue || (currentPage === SubscriptionStep.ChoosePlanStep && !selectedPackage) || isSubscribing
              }
              title={buttonText}
              containerStyle={{ margin: 20, marginTop: 12, width: '70%' }}
              buttonStyle={{ backgroundColor: theme.theme, paddingVertical: 12, borderRadius: 12 }}
            />
          </>
        )}
      </View>
    </ModalLayout>
  );
}
