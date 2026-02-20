import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";

const RC_IOS_KEY = "test_FsBJQkhsoVnVWLKupbnQbbtvVSt";
const RC_ANDROID_KEY = "YOUR_REVENUECAT_ANDROID_API_KEY";
const ENTITLEMENT_ID = "stepstrong Pro";

export function isNative() {
  return Capacitor.isNativePlatform();
}

export async function initPurchases() {
  if (!isNative()) return;
  const key = Capacitor.getPlatform() === "ios" ? RC_IOS_KEY : RC_ANDROID_KEY;
  await Purchases.configure({ apiKey: key });
  if (import.meta.env.DEV) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  }
}

export async function checkEntitlement() {
  if (!isNative()) return "free";
  try {
    const result = await Purchases.getCustomerInfo();
    const customerInfo = result?.customerInfo ?? result;
    const ent = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return ent ? "premium" : "free";
  } catch {
    return "free";
  }
}

export async function getOfferings() {
  if (!isNative()) return [];
  try {
    const result = await Purchases.getOfferings();
    const offerings = result?.offerings ?? result;
    return offerings?.current?.availablePackages ?? [];
  } catch (e) {
    console.log("RC getOfferings error:", e);
    return [];
  }
}

export async function purchasePackage(pkg) {
  if (!isNative()) return "free";
  try {
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    const customerInfo = result?.customerInfo ?? result;
    const ent = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return ent ? "premium" : "free";
  } catch (e) {
    if (e.userCancelled) return null; // user cancelled — not an error
    throw e;
  }
}

export async function restorePurchases() {
  if (!isNative()) return "free";
  try {
    const result = await Purchases.restorePurchases();
    const customerInfo = result?.customerInfo ?? result;
    const ent = customerInfo.entitlements.active[ENTITLEMENT_ID];
    return ent ? "premium" : "free";
  } catch {
    return "free";
  }
}
