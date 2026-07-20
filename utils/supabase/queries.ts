import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: any) => {
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

  // If in development mode or if explicit dev bypass is set, return a mock user
  if (process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true')) {
    return {
      id: 'dev-bypass-user-id',
      email: 'm1mdou7@gmail.com',
      user_metadata: {
        full_name: 'Dr. Ahmed (Dev Bypass)'
      },
      full_name: 'Dr. Ahmed (Dev Bypass)',
      isDevBypass: true
    } as any;
  }

  return null;
});

export const getSubscription = cache(async (supabase: any) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: any) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: any) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});
