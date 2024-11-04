import { PurchasesPackage } from 'react-native-purchases';

// Define a type for subscription identifiers

// Strings used to identify sponsored subscription plans for every platform

/**
 * Returns the number of required points for each subscription
 * @param product - The RevenueCat store product
 * @returns The number of points required for the subscription
 */
export function requiresWaitlist(product: PurchasesPackage): number {
  if (product.identifier === 'monthly_factor_0') return 2;
  if (product.identifier === 'monthly_factor_0_5') return 1;
  return 0;
}
