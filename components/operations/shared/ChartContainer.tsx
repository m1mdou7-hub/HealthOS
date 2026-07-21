import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: React.ReactNode;
  data: any[];
  title: string;
  desc: string;
  height?: number;
}

export const ChartContainer = ({ children, data, title, desc, height = 256 }: ChartContainerProps) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="w-full flex flex-col items-center justify-center text-zinc-500 font-mono space-y-2 border border-zinc-800 border-dashed rounded-xl">
        <Activity className="w-5 h-5 text-zinc-600" />
        <span className="text-xs">No analytics data available</span>
      </div>
    );
  }

  return (
    <>
      <div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono" aria-label={title}>{title}</h4>
        <p className="text-[10px] text-zinc-500 font-mono">{desc}</p>
      </div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </>
  );
};
