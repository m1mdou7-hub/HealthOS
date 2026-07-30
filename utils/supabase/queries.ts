import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: any) => {
  // Demo access must be explicitly enabled and is never available in production.
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
    return {
      id: 'd0000000-0000-0000-0000-000000000000',
      email: 'demo@healthos.local',
      user_metadata: {
        full_name: 'Dr. Ahmed (Dev Bypass)'
      },
      full_name: 'Dr. Ahmed (Dev Bypass)',
      isDevBypass: true
    } as any;
  }

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      return {
        ...user,
        isDevBypass: false
      };
    }
  } catch (e) {
    // ignore errors in dev mode if supabase is not reachable/configured yet
  }

  return null;
});

export const getSubscription = cache(async (supabase: any) => {
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (subscription) {
      return subscription;
    }
  } catch (err) {
    if (isDev) {
      console.warn('Supabase subscription query failed in dev mode, using high-fidelity mock active subscription...');
    } else {
      throw err;
    }
  }

  // If in development, return a mock subscription to enable full dashboard/settings testing
  if (isDev) {
    return {
      id: 'sub_dev_bypass_id',
      user_id: 'd0000000-0000-0000-0000-000000000000',
      status: 'active',
      metadata: {},
      price_id: 'price_dev_bypass_id',
      quantity: 1,
      cancel_at_period_end: false,
      created: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      prices: {
        id: 'price_dev_bypass_id',
        product_id: 'prod_dev_bypass_id',
        active: true,
        description: 'HealthOS Enterprise Unlimited Plan',
        unit_amount: 19900,
        currency: 'usd',
        type: 'recurring',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
        products: {
          id: 'prod_dev_bypass_id',
          active: true,
          name: 'Enterprise Unlimited Suite',
          description: 'All-inclusive premium digital dental and implant workspace.',
          image: null,
          metadata: {}
        }
      }
    } as any;
  }

  return null;
});

export const getProducts = cache(async (supabase: any) => {
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, prices(*)')
      .eq('active', true)
      .eq('prices.active', true)
      .order('metadata->index')
      .order('unit_amount', { referencedTable: 'prices' });

    if (products && products.length > 0) {
      return products;
    }
  } catch (e) {
    if (!isDev) {
      throw e;
    }
  }

  if (!isDev) {
    return [];
  }

  // Demo-only catalog. Real Stripe identifiers must come from Supabase.
  return [
    {
      id: 'prod_demo_starter',
      active: true,
      name: 'HealthOS Starter',
      description: 'Perfect for small dental offices, individual clinical researchers, or small clinics starting with digital dentistry.',
      image: null,
      metadata: { index: '0' },
      prices: [
        {
          id: 'price_demo_starter_monthly',
          product_id: 'prod_demo_starter',
          active: true,
          description: 'Starter Monthly Plan',
          unit_amount: 1000,
          currency: 'usd',
          type: 'recurring',
          interval: 'month',
          interval_count: 1,
          trial_period_days: 0,
          metadata: {}
        }
      ]
    },
    {
      id: 'prod_demo_professional',
      active: true,
      name: 'HealthOS Professional',
      description: 'Our most popular plan. Complete clinical workspace, advanced prosthodontics analytics, and fully-featured dental charts.',
      image: null,
      metadata: { index: '1' },
      prices: [
        {
          id: 'price_demo_professional_monthly',
          product_id: 'prod_demo_professional',
          active: true,
          description: 'Professional Monthly Plan',
          unit_amount: 9900,
          currency: 'usd',
          type: 'recurring',
          interval: 'month',
          interval_count: 1,
          trial_period_days: 0,
          metadata: {}
        }
      ]
    },
    {
      id: 'prod_demo_enterprise',
      active: true,
      name: 'HealthOS Enterprise',
      description: 'The ultimate enterprise solution. Unlimited practice management, high-translucency Zirconia sintering optimization algorithms, and advanced AI clinical assistance.',
      image: null,
      metadata: { index: '2' },
      prices: [
        {
          id: 'price_demo_enterprise_monthly',
          product_id: 'prod_demo_enterprise',
          active: true,
          description: 'Enterprise Monthly Plan',
          unit_amount: 29900,
          currency: 'usd',
          type: 'recurring',
          interval: 'month',
          interval_count: 1,
          trial_period_days: 0,
          metadata: {}
        }
      ]
    }
  ];
});

export const getUserDetails = cache(async (supabase: any) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});
