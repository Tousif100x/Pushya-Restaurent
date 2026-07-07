import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-forest-soft rounded-full p-6 mb-6">
        <div className="text-gold opacity-80 w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="font-serif text-2xl font-bold text-forest mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
