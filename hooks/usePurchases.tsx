import React, { createContext, useContext, useEffect, useState } from 'react';

import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesConfiguration, PurchasesPackage } from 'react-native-purchases';

import { usedConfig } from '@/common/config';
import { useUserProfile } from '@/common/profile';
import { isEligibleForTrial } from '@/components/features/subscription/util';
import { useSnackbar } from '@/components/global/Snackbar';

interface RevenueCatContextType {
  loading: boolean;
  purchasePackages?: PurchasesPackage[];
  customerInfo?: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo | undefined>>;
  eligibleForTrial?: PurchasesPackage | false;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const usePurchases = () => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [purchasePackages, setPurchasePackages] = useState<PurchasesPackage[] | undefined>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined);
  const [eligibleForTrial, setEligibleForTrial] = useState<PurchasesPackage | false | undefined>();
  const { profile } = useUserProfile();

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        const configuration: PurchasesConfiguration = {
          apiKey: Platform.OS === 'ios' ? usedConfig.revenueCat.appStore : usedConfig.revenueCat.playStore,
        };

        // Only configure the SDK when it's already configured. Calling configure multiple times is not recommended.
        // Read more here https://community.revenuecat.com/sdks-51/is-it-safe-to-call-purchases-configure-multiple-times-3608?postid=11617#post11617
        if (!(await Purchases.isConfigured())) Purchases.configure(configuration);

        const [packages] = await Promise.all([
          Purchases.getOfferings().then(res => {
            setPurchasePackages(res.current?.availablePackages);
            return res.current?.availablePackages;
          }),
          // This ensures that the customer is identified by their Divizend user ID.
          // Customers can benefit from their subscriptions on multiple platforms as long as they use the same Divizend account containing the subscription.
          Purchases.logIn(profile.id).then(loginResult => setCustomerInfo(loginResult.customerInfo)),
        ]);
        setLoading(false);

        Purchases.addCustomerInfoUpdateListener(info => setCustomerInfo(info));
        // If profile has already been setup, do not calculate this.
        if (!profile.flags.allowedCompanionAI) await isEligibleForTrial(packages!).then(setEligibleForTrial);
      } catch (error) {
        showSnackbar('Failed to configure in-app-purchases');
        // TODO: Sentry call here
        console.error(error);
      }
    };

    if (profile) configureRevenueCat();
  }, [profile.id]);

  return (
    <RevenueCatContext.Provider value={{ loading, purchasePackages, customerInfo, setCustomerInfo, eligibleForTrial }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
