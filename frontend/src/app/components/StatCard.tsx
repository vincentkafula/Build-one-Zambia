import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary to-primary/80',
      ring: 'ring-primary/20',
      text: 'text-primary-foreground'
    },
    success: {
      bg: 'bg-gradient-to-br from-[#198754] to-[#146644]',
      ring: 'ring-[#198754]/20',
      text: 'text-white'
    },
    warning: {
      bg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
      ring: 'ring-[#F59E0B]/20',
      text: 'text-white'
    },
    danger: {
      bg: 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C]',
      ring: 'ring-[#DC2626]/20',
      text: 'text-white'
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className="group bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`relative w-14 h-14 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shadow-lg ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
      </div>
    </div>
  );
}
