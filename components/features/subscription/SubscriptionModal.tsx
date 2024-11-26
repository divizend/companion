import React, { useRef, useState } from 'react';

import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { apiDelete, apiPost } from '@/common/api';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Button } from '@/components/base';
import ModalLayout from '@/components/global/ModalLayout';
import { useSnackbar } from '@/components/global/Snackbar';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import { useWaitlistStatus } from './queries';
import ConfirmationStep from './steps/ConfirmationStep';
import ExplainerStep from './steps/ExplainerStep';
import JoinedWaitlistStep from './steps/JoinedWaitlistStep';
import SolidarityDisclaimerStep from './steps/SolidarityDisclaimerStep';
import SubscriptionOptions from './steps/SubscriptionOptions';
import { requiresWaitlist } from './util';

type Props = { dismiss: () => void };

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

const { width: screenWidth } = Dimensions.get('window');

export default function SubscriptionModal({ dismiss }: Props) {
  const { loading, purchasePackages, setCustomerInfo, refreshCustomerInfo } = usePurchases();
  const { showSnackbar } = useSnackbar();

  const theme = useThemeColor();

  const [currentPage, setCurrentPage] = useState<SubscriptionStep>(SubscriptionStep.ExplainerStep);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage>();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { data, isLoading, refetch } = useWaitlistStatus();
  // A flag used to know if a user has purchased a plan or he was added to the waiting list.
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!canContinue) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(page as SubscriptionStep);
  };

  const handleSubscribe = async (product: PurchasesPackage) => {
    await Purchases.purchasePackage(product)
      .then(makePurchaseResult => {
        if (makePurchaseResult.customerInfo.entitlements.all['divizend-membership']?.store === 'PROMOTIONAL')
          // If a trial exists, revoke it so the user gets the right package displayed instead of the trial after purchase.
          apiDelete('/revoke-trial').then(refreshCustomerInfo);
        else setCustomerInfo(makePurchaseResult.customerInfo);
        setHasSubscribed(true);
      })
      .then(() =>
        setTimeout(
          () =>
            scrollViewRef.current?.scrollTo({
              x: screenWidth * SubscriptionStep.FinalStep,
              animated: true,
            }),
          200,
        ),
      );
  };

  if (loading || !purchasePackages || isLoading || !data) return <FullScreenActivityIndicator />;

  const isSpotReserved = (purchasePackage: PurchasesPackage): boolean => {
    if (!data.waitingForPoints) return false;
    if (requiresWaitlist(purchasePackage) === data.spotsReserved) return true;
    return false;
  };

  const attemptSubscribe = async (purchasePackage: PurchasesPackage) => {
    try {
      setIsSubscribing(true);

      // If the subscription is not sponsored, directly open the payment modal.
      const pointsRequired = requiresWaitlist(purchasePackage);
      if (!pointsRequired) return await handleSubscribe(purchasePackage);

      // Can purhcase only returns true when the spots were reserved on that call.
      const canPurchase = await apiPost<boolean>('/sponsored-purchase/initialize', {
        points: pointsRequired,
      });
      if (canPurchase || isSpotReserved(purchasePackage)) return await handleSubscribe(purchasePackage);
      else {
        refetch();
        setTimeout(
          () =>
            scrollViewRef.current?.scrollTo({
              x: screenWidth * SubscriptionStep.FinalStep,
              animated: true,
            }),
          200,
        );
      }
    } catch (error: any) {
      console.error(error);
      showSnackbar(error.message, { type: 'error' });
    } finally {
      setIsSubscribing(false);
    }
  };

  const userInWaitlist = !!data.waitingForPoints;

  const handleNextStep = () => {
    switch (currentPage) {
      case SubscriptionStep.ExplainerStep:
        setTimeout(
          () =>
            scrollViewRef.current?.scrollTo({
              x: screenWidth * SubscriptionStep.ChoosePlanStep,
              animated: true,
            }),
          200,
        );

        break;
      case SubscriptionStep.ChoosePlanStep: {
        if (selectedPackage?.identifier === purchasePackages[2].identifier) attemptSubscribe(selectedPackage);
        else
          setTimeout(
            () =>
              scrollViewRef.current?.scrollTo({
                x: screenWidth * SubscriptionStep.SolidarityDisclaimerStep,
                animated: true,
              }),
            200,
          );
        break;
      }

      case SubscriptionStep.SolidarityDisclaimerStep: {
        if (selectedPackage && selectedPackage.identifier !== purchasePackages[2].identifier)
          attemptSubscribe(selectedPackage);
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
      <View className="flex-1 justify-center items-center">
        <ScrollView
          scrollEnabled={true}
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          onScroll={handleScroll}
        >
          <View style={{ width: screenWidth }}>
            <ExplainerStep setCanContinue={setCanContinue} canContinue={canContinue} />
          </View>
          <View style={{ width: screenWidth }}>
            <SubscriptionOptions selectedPackage={selectedPackage} setSelectedPackage={setSelectedPackage} />
          </View>
          <View style={{ width: screenWidth }}>
            <SolidarityDisclaimerStep canContinue={canContinue} setCanContinue={setCanContinue} />
          </View>
          <View style={{ width: screenWidth }}>{hasSubscribed ? <ConfirmationStep /> : <JoinedWaitlistStep />}</View>
        </ScrollView>
        <Button
          loading={isSubscribing}
          onPress={handleNextStep}
          disabled={
            !canContinue || (currentPage === SubscriptionStep.ChoosePlanStep && !selectedPackage) || isSubscribing
          }
          title={buttonText}
          containerStyle={{ margin: 20, marginTop: 0, width: '70%' }}
          buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12 }}
        />
      </View>
    </ModalLayout>
  );
}
