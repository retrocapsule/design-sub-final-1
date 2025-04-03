import React from 'react';

type DashboardHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground pt-1">
            {description}
          </p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}