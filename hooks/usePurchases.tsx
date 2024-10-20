import React, { createContext, useContext, useEffect, useState } from 'react';

import Purchases, { LOG_LEVEL, PurchasesConfiguration, PurchasesStoreProduct } from 'react-native-purchases';

import { useUserProfile } from '@/common/profile';
import { productsMock } from '@/common/revenuecat-mock';

interface RevenueCatContextType {
  loading: boolean;
  products?: PurchasesStoreProduct[];
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
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PurchasesStoreProduct[] | undefined>();
  const { profile } = useUserProfile();

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        const configuration: PurchasesConfiguration = {
          // TODO: Also configure for iOS. Currently only configured with Android and the Play Store.
          apiKey: 'goog_cfpJuVihNJVjRmkmxMlRhqoQyQr',
          // This ensures that the subscriptions are tied to the user's ID, otherwise the user loses their subscripton when they delete the app.
          appUserID: profile.id,
        };

        // setProducts(productsMock);
        await Purchases.configure(configuration);
        setLoading(false);
        await Purchases.getOfferings().then(res => {
          setProducts(res.current?.availablePackages.map(availablePackage => availablePackage.product));
        });
      } catch (error) {
        console.error('Failed to configure RevenueCat:', JSON.stringify(error));
      }
    };

    if (profile) configureRevenueCat();
  }, [profile.id]);

  return <RevenueCatContext.Provider value={{ loading, products }}>{children}</RevenueCatContext.Provider>;
};
