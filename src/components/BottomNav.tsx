import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, ClipboardCheck, Target, Heart, Wrench } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Painel' },
  { to: '/treino', icon: Dumbbell, label: 'Treino' },
  { to: '/dieta', icon: UtensilsCrossed, label: 'Dieta' },
  { to: '/checklist', icon: ClipboardCheck, label: 'Check' },
  { to: '/corpo', icon: Target, label: 'Corpo' },
  { to: '/ferramentas', icon: Wrench, label: 'Tools' },
] as const;

export function BottomNav() {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 py-2 safe-area-bottom">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="h-0.5 w-4 rounded-full bg-primary mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
