import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Not throwing at import time so the app still builds without keys;
  // routes that use Stripe will surface a clear error instead.
  console.warn("STRIPE_SECRET_KEY is not set — checkout will not work until it is configured.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});

export const DELIVERY_FEE_PENCE = 499;
export const FREE_DELIVERY_THRESHOLD_PENCE = 4000;
