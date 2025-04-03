type AdminHeaderProps = {
  title: string;
  description?: string;
};

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <div className="pb-6 border-b border-slate-800">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground pt-1">
          {description}
        </p>
      )}
    </div>
  );
} 