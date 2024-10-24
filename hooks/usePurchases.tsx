import React, { createContext, useContext, useEffect, useState } from 'react';

import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesConfiguration, PurchasesStoreProduct } from 'react-native-purchases';

import { usedConfig } from '@/common/config';
import { useUserProfile } from '@/common/profile';
import { useSnackbar } from '@/components/global/Snackbar';

interface RevenueCatContextType {
  loading: boolean;
  products?: PurchasesStoreProduct[];
  customerInfo?: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo | undefined>>;
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
  const [products, setProducts] = useState<PurchasesStoreProduct[] | undefined>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined);
  const { profile } = useUserProfile();

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        const configuration: PurchasesConfiguration = {
          apiKey: Platform.OS === 'ios' ? usedConfig.revenueCat.appStore : usedConfig.revenueCat.playStore,
        };

        try {
          // Only configure the SDK when it's already configured. Calling configure multiple times is not recommended.
          // Read more here https://community.revenuecat.com/sdks-51/is-it-safe-to-call-purchases-configure-multiple-times-3608?postid=11617#post11617
          if (!(await Purchases.isConfigured())) Purchases.configure(configuration);
        } catch (error) {
          console.log(error);
        }
        await Promise.all([
          Purchases.getOfferings().then(res =>
            setProducts(res.current?.availablePackages.map(availablePackage => availablePackage.product)),
          ),
          // This ensures that the customer is identified by their Divizend user ID.
          // Customers can benefit from their subscriptions on multiple platforms as long as they use the same Divizend account containing the subscription.
          Purchases.logIn(profile.id).then(loginResult => setCustomerInfo(loginResult.customerInfo)),
        ]);
        setLoading(false);

        Purchases.addCustomerInfoUpdateListener(info => setCustomerInfo(info));
      } catch (error) {
        showSnackbar('Failed to configure RevenueCat: ' + JSON.stringify(error));
        console.error('Failed to configure RevenueCat:', JSON.stringify(error));
      }
    };

    if (profile) configureRevenueCat();
  }, [profile.id]);

  return (
    <RevenueCatContext.Provider value={{ loading, products, customerInfo, setCustomerInfo }}>
      {children}
    </RevenueCatContext.Provider>
  );
};
