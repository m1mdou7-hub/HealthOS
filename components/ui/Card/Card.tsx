import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, description, footer, children }: Props) {
  return (
    <div className="w-full max-w-3xl m-auto my-8 card-elevated overflow-hidden rounded-3xl">
      <div className="px-6 py-5">
        <h3 className="mb-1 text-2xl font-semibold font-display tracking-tight" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
        {children}
      </div>
      {footer && (
        <div
          className="p-4 border-t rounded-b-3xl"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
