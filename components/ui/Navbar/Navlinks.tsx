'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const pathname = usePathname();

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight" aria-label="Logo">
          <Logo />
          <span>HealthOS</span>
        </Link>
        <nav className="ml-6 space-x-2 hidden md:block" aria-label="Desktop Navigation">
          <Link href="/" className={s.link} aria-current={pathname === '/' ? 'page' : undefined}>
            Workspace Platform
          </Link>
        </nav>
      </div>
      <div className="flex justify-end space-x-8">
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit" className={s.link}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/signin" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
