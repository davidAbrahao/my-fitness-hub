import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '../components/PageHeader';
import { AdvancedDashboard } from '../components/AdvancedDashboard';
import { NutritionTodayCard } from '../components/NutritionTodayCard';
import { AIInsightsCard } from '../components/AIInsightsCard';
import { SyncStatus } from '../components/SyncStatus';
import { Zap, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: 'Painel — Barriga Zero' }],
  }),
});

function DashboardPage() {
  return (
    <div>
      <PageHeader title="PAINEL" subtitle="Visão completa & análises" emoji="📊" />

      {/* Atalho pra Hoje */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <Link
          to="/hoje"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-black text-xs px-3 py-2 rounded-lg neon-glow"
        >
          <Zap size={14} /> Ir para Hoje <ChevronRight size={12} />
        </Link>
        <SyncStatus />
      </div>

      <div className="mb-4">
        <NutritionTodayCard />
      </div>

      <AdvancedDashboard />

      <div className="mb-4 mt-2">
        <AIInsightsCard />
      </div>
    </div>
  );
}
