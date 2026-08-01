import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from '@/utils/supabase/admin';

console.log("WEBHOOK MODULE LOADED");

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error(`[Webhook Executing Path] Returning 400 because signature or webhookSecret is missing. sig: ${sig ? 'present' : 'missing'}, webhookSecret: ${webhookSecret ? 'present' : 'missing'}`);
      return new Response('Webhook secret not found.', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret as string);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message);
    console.error(`[Webhook Executing Path] Returning 400 due to constructEvent exception.`);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Webhook construction failed",
      }, null, 2),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  if (relevantEvents.has(event.type)) {
    try {
      console.log(`[Webhook Executing Path] Processing relevant event: ${event.type}`);
      switch (event.type) {
        case 'product.created':
        case 'product.updated': {
          const product = event.data.object as Stripe.Product;
          console.log(`[Webhook Executing Path] Upserting product: ${product.id}`);
          await upsertProductRecord(product);
          console.log(`[Webhook Executing Path] Product upsert successful: ${product.id}`);
          break;
        }
        case 'price.created':
        case 'price.updated': {
          const price = event.data.object as Stripe.Price;
          console.log(`[Webhook Executing Path] Upserting price: ${price.id}`);
          await upsertPriceRecord(price);
          console.log(`[Webhook Executing Path] Price upsert successful: ${price.id}`);
          break;
        }
        case 'price.deleted': {
          const price = event.data.object as Stripe.Price;
          console.log(`[Webhook Executing Path] Deleting price: ${price.id}`);
          await deletePriceRecord(price);
          console.log(`[Webhook Executing Path] Price delete successful: ${price.id}`);
          break;
        }
        case 'product.deleted': {
          const product = event.data.object as Stripe.Product;
          console.log(`[Webhook Executing Path] Deleting product: ${product.id}`);
          await deleteProductRecord(product);
          console.log(`[Webhook Executing Path] Product delete successful: ${product.id}`);
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Webhook Executing Path] Managing subscription change: ${subscription.id} for customer ${subscription.customer}, event: ${event.type}`);
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          console.log(`[Webhook Executing Path] Subscription change successful: ${subscription.id}`);
          break;
        }
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log(`[Webhook Executing Path] Checkout session completed: ${checkoutSession.id}, mode: ${checkoutSession.mode}`);
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            console.log(`[Webhook Executing Path] Provisioning subscription: ${subscriptionId} for customer ${checkoutSession.customer}`);
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
            console.log(`[Webhook Executing Path] Subscription provision successful: ${subscriptionId}`);
          }
          break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error: any) {
      console.error("=== WEBHOOK HANDLER ERROR ===");
      console.error('Event processing failed:', error?.message);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Webhook handler failed",
        }, null, 2),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  } else {
    console.log(`[Webhook Executing Path] Unhandled non-relevant event: ${event.type}`);
    console.error(`[Webhook Executing Path] Returning 400 because event type is unhandled/non-relevant: ${event.type}`);
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
