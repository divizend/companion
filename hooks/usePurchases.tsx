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
        await isEligibleForTrial(packages!).then(setEligibleForTrial);
      } catch (error) {
        showSnackbar('Failed to configure in-app-purchases');
        // TODO: Sentry call here
        console.error(error);
      }
    };

    if (profile.id) configureRevenueCat();
  }, [profile.id, showSnackbar]);

  return (
    <RevenueCatContext.Provider value={{ loading, purchasePackages, customerInfo, setCustomerInfo, eligibleForTrial }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

// To use in order to simulate a subscription (TRIAL)
// {
//   "nonSubscriptionTransactions": [],
//   "originalPurchaseDate": null,
//   "allPurchaseDatesMillis": {
//     "companion_basic_0:factor-1": 1730904858000
//   },
//   "managementURL": "https://play.google.com/store/account/subscriptions",
//   "allPurchaseDates": {
//     "companion_basic_0:factor-1": "2024-11-06T14:54:18.000Z"
//   },
//   "originalAppUserId": "65d604e5f38a586135e224a5",
//   "allExpirationDates": {
//     "companion_basic_0:factor-1": "2024-11-06T14:57:16.000Z"
//   },
//   "firstSeen": "2024-10-25T11:44:12.000Z",
//   "originalPurchaseDateMillis": null,
//   "allExpirationDatesMillis": {
//     "companion_basic_0:factor-1": 1730905036000
//   },
//   "requestDateMillis": 1730904863712,
//   "latestExpirationDate": "2024-11-06T14:57:16.000Z",
//   "firstSeenMillis": 1729856652000,
//   "allPurchasedProductIdentifiers": [
//     "companion_basic_0:factor-1"
//   ],
//   "requestDate": "2024-11-06T14:54:23.712Z",
//   "latestExpirationDateMillis": 1730905036000,
//   "originalApplicationVersion": null,
//   "activeSubscriptions": [
//     "companion_basic_0:factor-1"
//   ],
//   "entitlements": {
//     "active": {
//       "divizend-membership": {
//         "billingIssueDetectedAtMillis": null,
//         "billingIssueDetectedAt": null,
//         "unsubscribeDetectedAtMillis": null,
//         "productIdentifier": "companion_basic_0",
//         "unsubscribeDetectedAt": null,
//         "productPlanIdentifier": "factor-1",
//         "identifier": "divizend-membership",
//         "isActive": true,
//         "periodType": "TRIAL",
//         "store": "PLAY_STORE",
//         "expirationDateMillis": 1730905036000,
//         "originalPurchaseDateMillis": 1730904858000,
//         "ownershipType": "UNKNOWN",
//         "willRenew": true,
//         "latestPurchaseDate": "2024-11-06T14:54:18.000Z",
//         "expirationDate": "2024-11-06T14:57:16.000Z",
//         "verification": "NOT_REQUESTED",
//         "originalPurchaseDate": "2024-11-06T14:54:18.000Z",
//         "isSandbox": true,
//         "latestPurchaseDateMillis": 1730904858000
//       }
//     },
//     "verification": "NOT_REQUESTED",
//     "all": {
//       "divizend-membership": {
//         "billingIssueDetectedAtMillis": null,
//         "billingIssueDetectedAt": null,
//         "unsubscribeDetectedAtMillis": null,
//         "productIdentifier": "companion_basic_0",
//         "unsubscribeDetectedAt": null,
//         "productPlanIdentifier": "factor-1",
//         "identifier": "divizend-membership",
//         "isActive": true,
//         "periodType": "TRIAL",
//         "store": "PLAY_STORE",
//         "expirationDateMillis": 1730905036000,
//         "originalPurchaseDateMillis": 1730904858000,
//         "ownershipType": "UNKNOWN",
//         "willRenew": true,
//         "latestPurchaseDate": "2024-11-06T14:54:18.000Z",
//         "expirationDate": "2024-11-06T14:57:16.000Z",
//         "verification": "NOT_REQUESTED",
//         "originalPurchaseDate": "2024-11-06T14:54:18.000Z",
//         "isSandbox": true,
//         "latestPurchaseDateMillis": 1730904858000
//       }
//     }
//   }
// }
