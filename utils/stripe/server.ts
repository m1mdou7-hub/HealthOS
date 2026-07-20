'use server';

import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp
} from '@/utils/helpers';
import { Tables } from '@/types_db';

type Price = Tables<'prices'>;

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    let user;
    if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
      user = {
        id: 'd0000000-0000-0000-0000-000000000000',
        email: 'm1mdou7@gmail.com',
        user_metadata: {
          full_name: 'Dr. Ahmed (Dev Bypass)'
        }
      };
    } else {
      const {
        error,
        data: { user: supabaseUser }
      } = await supabase.auth.getUser();

      if (error || !supabaseUser) {
        console.error(error);
        throw new Error('Could not get user session.');
      }
      user = supabaseUser;
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      customer_update: {
        address: 'auto'
      },
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      cancel_url: getURL(),
      success_url: getURL(redirectPath)
    };

    console.log(
      'Trial end:',
      calculateTrialEndUnixTimestamp(price.trial_period_days)
    );
    if (price.type === 'recurring') {
      params = {
        ...params,
        mode: 'subscription',
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days)
        }
      };
    } else if (price.type === 'one_time') {
      params = {
        ...params,
        mode: 'payment'
      };
    }

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
        console.warn('Stripe checkout session creation failed in dev. Falling back to a mock successful checkout redirect...');
        return {
          errorRedirect: '/settings?checkout=success'
        };
      }
      throw new Error('Unable to create checkout session.');
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id };
    } else {
      if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
        return {
          errorRedirect: '/settings?checkout=success'
        };
      }
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = createClient();
    let user;
    if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
      user = {
        id: 'd0000000-0000-0000-0000-000000000000',
        email: 'm1mdou7@gmail.com',
        user_metadata: {
          full_name: 'Dr. Ahmed (Dev Bypass)'
        }
      };
    } else {
      const {
        error,
        data: { user: supabaseUser }
      } = await supabase.auth.getUser();

      if (!supabaseUser) {
        if (error) {
          console.error(error);
        }
        throw new Error('Could not get user session.');
      }
      user = supabaseUser;
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL('/settings')
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
        console.warn('Billing portal session creation failed in dev. Mocking portal redirect...');
        return getURL('/settings?portal=mock_success');
      }
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        'Please try again later or contact a system administrator.'
      );
    } else {
      return getErrorRedirect(
        currentPath,
        'An unknown error occurred.',
        'Please try again later or contact a system administrator.'
      );
    }
  }
}
