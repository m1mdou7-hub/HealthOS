import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer
      className="mx-auto max-w-[1920px] px-6 border-t"
      style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}
    >
      <div
        className="grid grid-cols-1 gap-8 py-12 transition-colors duration-150 lg:grid-cols-12"
        style={{ color: 'var(--text)' }}
      >
        <div className="col-span-1 lg:col-span-4">
          <Link
            href="/"
            className="flex items-center flex-initial font-bold text-lg tracking-tight gap-2.5"
            style={{ color: 'var(--text)' }}
          >
            <Logo />
            <span className="font-display">HealthOS</span>
          </Link>
          <p className="mt-4 text-xs max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            HealthOS is a comprehensive, commercial operating system and enterprise clinical dashboard designed to streamline modern patient care, pathology logs, imaging charts, and diagnostics.
          </p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <h5
            className="font-bold text-xs uppercase tracking-wider mb-4"
            style={{ color: 'var(--text-sub)' }}
          >
            Platform
          </h5>
          <ul className="flex flex-col space-y-3">
            <li>
              <Link href="/" className="text-sm transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Home Portal
              </Link>
            </li>
            <li>
              <Link href="/signin" className="text-sm transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Operator Sign In
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <h5
            className="font-bold text-xs uppercase tracking-wider mb-4"
            style={{ color: 'var(--text-sub)' }}
          >
            Legal
          </h5>
          <ul className="flex flex-col space-y-3">
            <li>
              <Link href="/" className="text-sm transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="text-sm transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-between py-8 border-t md:flex-row text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
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
