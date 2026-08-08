'use client';

import { useToast, toast } from '@/components/ui/Toasts/toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ToastContainer as DesignToaster } from '@/components/ui/design-system/primitives';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('status');
    const status_description = searchParams.get('status_description');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    if (error || status) {
      toast({
        title: error ? error ?? 'Hmm... Something went wrong.' : status ?? 'Alright!',
        description: error ? (error_description ?? undefined) : (status_description ?? undefined),
        type: error ? 'error' : 'success',
      });
      const newSearchParams = new URLSearchParams(searchParams.toString());
      const paramsToRemove = ['error', 'status', 'status_description', 'error_description'];
      paramsToRemove.forEach((param) => newSearchParams.delete(param));
      const redirectPath = `${pathname}?${newSearchParams.toString()}`;
      router.replace(redirectPath, { scroll: false });
    }
  }, [searchParams, pathname, router, toast]);

  return (
    <DesignToaster
      toasts={toasts.map(t => ({ ...t, type: t.type === 'error' ? 'error' : 'success' as const }))}
      onRemove={(index) => dismiss(toasts[index]?.id)}
    />
  );
}