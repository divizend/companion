import React, { createContext, useContext, useEffect, useState } from 'react';

import Purchases, { LOG_LEVEL, PurchasesConfiguration, PurchasesStoreProduct } from 'react-native-purchases';

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

  useEffect(() => {
    const configureRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        const configuration: PurchasesConfiguration = {
          apiKey: 'goog_cfpJuVihNJVjRmkmxMlRhqoQyQr',
          // Add other configuration options as needed
        };

        setProducts(productsMock);
        // await Purchases.configure(configuration);
        setLoading(false);
        // await Purchases.getOfferings().then(console.log);
      } catch (error) {
        console.error('Failed to configure RevenueCat:', JSON.stringify(error));
      }
    };

    configureRevenueCat();
  }, []);

  return <RevenueCatContext.Provider value={{ loading, products }}>{children}</RevenueCatContext.Provider>;
};
