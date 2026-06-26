import { Shield } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  variant?: 'dark' | 'light';
}

export function PageLoader({ message = 'Loading…', variant = 'light' }: PageLoaderProps) {
  const isDark = variant === 'dark';
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-5 ${isDark ? 'bg-gray-950' : 'bg-background'}`}>
      <div className="relative">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-green-600/20 border border-green-500/30' : 'bg-primary/10 border border-primary/20'}`}>
          <Shield className={`w-7 h-7 ${isDark ? 'text-green-400' : 'text-primary'}`} />
        </div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 rounded-full animate-spin ${isDark ? 'border-green-500/30 border-t-green-400' : 'border-primary/30 border-t-primary'}`} />
      </div>
      <div className="text-center">
        <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-foreground'}`}>
          Build One Zambia
        </div>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>{message}</div>
      </div>
    </div>
  );
}

export function InlineLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
