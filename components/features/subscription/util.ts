import { Platform } from 'react-native';
import Purchases, { INTRO_ELIGIBILITY_STATUS, PurchasesPackage } from 'react-native-purchases';

// Define a type for subscription identifiers

// Strings used to identify sponsored subscription plans for every platform

export const TRIAL_PACKAGE_IDENTIFIER = 'monthly_factor_1';

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

/**
 * iOS and Android. Verifies if the user is eligible for a free trial.
 * @param products Product package list to look for free trial items
 * @returns `PurchasesPackage` if eligible, `false` if not eligible
 */
export async function isEligibleForTrial(products: PurchasesPackage[]): Promise<PurchasesPackage | false> {
  const productWithTrial = products.find(product => product.identifier === TRIAL_PACKAGE_IDENTIFIER);
  if (!productWithTrial) return false;

  // Android
  return Platform.OS === 'android'
    ? isEligibleForTrialAndroid(productWithTrial)
    : isEligibleForTrialiOS(productWithTrial);
}

function isEligibleForTrialAndroid(productWithTrial: PurchasesPackage): PurchasesPackage | false {
  const subscriptionOptionWithTrial = productWithTrial.product.subscriptionOptions?.find(option => !!option.freePhase);
  if (!subscriptionOptionWithTrial) return false;

  return productWithTrial;
}

async function isEligibleForTrialiOS(productWithTrial: PurchasesPackage): Promise<PurchasesPackage | false> {
  const eligibility = (await Purchases.checkTrialOrIntroductoryPriceEligibility([productWithTrial.product.identifier]))[
    productWithTrial.product.identifier
  ];
  if (eligibility.status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) return false;
  return productWithTrial;
}
