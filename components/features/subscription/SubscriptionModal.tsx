import React, { useRef, useState } from 'react';

import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { apiDelete, apiPost } from '@/common/api';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Button } from '@/components/base';
import ModalLayout from '@/components/global/ModalLayout';
import { useSnackbar } from '@/components/global/Snackbar';
import { showAlert } from '@/components/global/prompt';
import { usePurchases } from '@/hooks/usePurchases';
import { t } from '@/i18n';

import { useWaitlistStatus } from './queries';
import ExplainerStep from './steps/ExplainerStep';
import SolidarityDisclaimer from './steps/SolidarityDisclaimer';
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
  ConfirmationStep = 3,
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SubscriptionModal({ dismiss }: Props) {
  const { loading, purchasePackages, setCustomerInfo, refreshCustomerInfo } = usePurchases();
  const { showSnackbar } = useSnackbar();

  const [currentPage, setCurrentPage] = useState<SubscriptionStep>(SubscriptionStep.ExplainerStep);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage>();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { data, isLoading, refetch } = useWaitlistStatus();

  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!canContinue) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(page as SubscriptionStep);
  };

  const handleSubscribe = async (product: PurchasesPackage) => {
    await Purchases.purchasePackage(product)
      .then(makePurchaseResult =>
        makePurchaseResult.customerInfo.entitlements.all['divizend-membership']?.store === 'PROMOTIONAL'
          ? // If a trial exists, revoke it so the user gets the right package displayed instead of the trial after purchase.
            apiDelete('/revoke-trial').then(refreshCustomerInfo)
          : setCustomerInfo(makePurchaseResult.customerInfo),
      )
      .catch(err => showSnackbar(err.message, { type: 'error' }));
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

      const pointsRequired = requiresWaitlist(purchasePackage);
      if (!pointsRequired) return await handleSubscribe(purchasePackage);
      // Can purhcase only returns true when the spots were reserved on that call.
      const canPurchase = await apiPost<boolean>('/sponsored-purchase/initialize', {
        points: pointsRequired,
      });
      if (canPurchase || isSpotReserved(purchasePackage))
        return await handleSubscribe(purchasePackage).then(() =>
          setTimeout(
            () =>
              scrollViewRef.current?.scrollTo({
                x: screenWidth * 3,
                animated: true,
              }),
            200,
          ),
        );
      else {
        refetch();
        showAlert({
          title: 'You joined the waitlist',
          message:
            'You have opted for a sponsored subscription plan but there are no available spots. We will send you an email when you are ready to finalize the subscription.',
          actions: [{ title: 'OK' }],
        });
      }
    } catch (error) {
      console.error(error);
      showSnackbar('Error', { type: 'error' });
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
              x: screenWidth * (currentPage + 1),
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
                x: screenWidth * (currentPage + 1),
                animated: true,
              }),
            200,
          );
      }

      default:
        break;
    }
  };

  return (
    <ModalLayout noScrollView title={t('subscription.choosePlan.title')} dismiss={dismiss}>
      <View className="flex-1 justify-center items-center">
        <ScrollView
          scrollEnabled={false}
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
            <SolidarityDisclaimer canContinue={canContinue} setCanContinue={setCanContinue} />
          </View>
        </ScrollView>
        <Button
          onPress={handleNextStep}
          disabled={!canContinue || (currentPage === SubscriptionStep.ChoosePlanStep && !selectedPackage)}
          title={t('subscription.choosePlan.button.continue')}
          containerStyle={{ margin: 20, marginTop: 0, width: '70%' }}
        />
      </View>
    </ModalLayout>
  );
}
