import React from 'react';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="border-t border-slate-700/80 pt-5 mt-5">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}
