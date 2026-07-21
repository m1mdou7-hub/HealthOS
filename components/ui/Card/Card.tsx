import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function Card({ title, description, footer, children, headingLevel = 'h3' }: Props) {
  const Heading = headingLevel;

  return (
    <div className="w-full max-w-3xl m-auto my-8 border rounded-md p border-zinc-700">
      <div className="px-5 py-4">
        <Heading className="mb-1 text-2xl font-medium">{title}</Heading>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
}
