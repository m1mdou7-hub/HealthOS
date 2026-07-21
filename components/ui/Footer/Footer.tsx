import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-950 border-t border-zinc-900" aria-label="Footer Navigation">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 lg:grid-cols-12 bg-zinc-950">
        <div className="col-span-1 lg:col-span-4">
          <Link
            href="/"
            className="flex items-center flex-initial font-bold text-white text-lg tracking-tight gap-2.5"
          >
            <Logo />
            <span>HealthOS</span>
          </Link>
          <p className="mt-4 text-xs text-zinc-500 max-w-sm leading-relaxed">
            HealthOS is a comprehensive, commercial operating system and enterprise clinical dashboard designed to streamline modern patient care, pathology logs, imaging charts, and diagnostics.
          </p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-wider mb-4">Platform</h5>
          <ul className="flex flex-col space-y-3">
            <li>
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-200 transition">
                Home Portal
              </Link>
            </li>
            <li>
              <Link href="/signin" className="text-sm text-zinc-500 hover:text-zinc-200 transition">
                Operator Sign In
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-wider mb-4">Legal</h5>
          <ul className="flex flex-col space-y-3">
            <li>
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-200 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-200 transition">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-8 border-t border-zinc-900 md:flex-row bg-zinc-950 text-xs text-zinc-500">
        <div>
          <span>
            &copy; {new Date().getFullYear()} HealthOS, Inc. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span>STATUS:</span>
          <span className="text-emerald-400">SECURE NODE</span>
        </div>
      </div>
    </footer>
  );
}
