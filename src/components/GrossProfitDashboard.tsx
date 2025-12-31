// v2.1 - Premium GP dashboard with glass cards and visual indicators + responsive layout
import { useData } from '../context/DataContext';
import { projects, users } from '../data/mockData';
import type { ProjectGrossProfit } from '../types';

export function GrossProfitDashboard() {
  const { timesheets, expenses } = useData();

  const calculateGP = (): ProjectGrossProfit[] => {
    return projects.map(project => {
      const approvedTimesheets = timesheets.filter(t => t.projectId === project.id && t.status === 'approved');
      const laborCost = approvedTimesheets.reduce((sum, t) => {
        const user = users.find(u => u.id === t.userId);
        return sum + (t.hours * (user?.hourlyRate || 0));
      }, 0);

      const approvedExpenses = expenses.filter(e => e.projectId === project.id && e.status === 'approved');
      const travelExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

      const grossProfit = project.revenue - laborCost - travelExpense;
      const margin = project.revenue > 0 ? (grossProfit / project.revenue) * 100 : 0;

      return { projectId: project.id, revenue: project.revenue, laborCost, travelExpense, grossProfit, margin };
    });
  };

  const gpData = calculateGP();
  const getProject = (id: string) => projects.find(p => p.id === id);

  const totals = gpData.reduce((acc, gp) => ({
    revenue: acc.revenue + gp.revenue,
    laborCost: acc.laborCost + gp.laborCost,
    travelExpense: acc.travelExpense + gp.travelExpense,
    grossProfit: acc.grossProfit + gp.grossProfit,
  }), { revenue: 0, laborCost: 0, travelExpense: 0, grossProfit: 0 });

  const totalMargin = totals.revenue > 0 ? (totals.grossProfit / totals.revenue) * 100 : 0;

  const StatCard = ({ icon, label, value, color, delay }: { icon: string; label: string; value: string; color: string; delay: number }) => (
    <div style={{
      background: 'rgba(26, 34, 52, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '16px',
      padding: '1.25rem',
      animation: 'fadeInUp 0.5s ease forwards',
      animationDelay: `${delay}s`,
      opacity: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );

  const MarginBadge = ({ margin }: { margin: number }) => {
    const config = margin >= 30
      ? { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }
      : margin >= 0
      ? { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }
      : { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}>
        {margin.toFixed(1)}%
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
          📊 毛利分析
        </h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          * 仅计算已审核通过的工时和差旅费
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard icon="💰" label="总收入" value={`¥${totals.revenue.toLocaleString()}`} color="#f8fafc" delay={0} />
        <StatCard icon="👥" label="人工成本" value={`¥${totals.laborCost.toLocaleString()}`} color="#f87171" delay={0.1} />
        <StatCard icon="✈️" label="差旅费" value={`¥${totals.travelExpense.toLocaleString()}`} color="#fbbf24" delay={0.2} />
        <StatCard icon="📈" label="总毛利" value={`¥${totals.grossProfit.toLocaleString()}`} color={totals.grossProfit >= 0 ? '#34d399' : '#f87171'} delay={0.3} />
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(26, 34, 52, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '16px',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{ minWidth: '550px' }}>
          <thead>
            <tr>
              <th>项目</th>
              <th>收入</th>
              <th>人工成本</th>
              <th>差旅费</th>
              <th>毛利</th>
              <th>毛利率</th>
            </tr>
          </thead>
          <tbody>
            {gpData.map(gp => (
              <tr key={gp.projectId}>
                <td style={{ color: '#f8fafc', fontWeight: 500 }}>{getProject(gp.projectId)?.name}</td>
                <td>¥{gp.revenue.toLocaleString()}</td>
                <td style={{ color: '#f87171' }}>¥{gp.laborCost.toLocaleString()}</td>
                <td style={{ color: '#fbbf24' }}>¥{gp.travelExpense.toLocaleString()}</td>
                <td>
                  <span style={{ color: gp.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                    ¥{gp.grossProfit.toLocaleString()}
                  </span>
                </td>
                <td><MarginBadge margin={gp.margin} /></td>
              </tr>
            ))}
            {/* Totals row */}
            <tr style={{ background: 'rgba(6, 214, 160, 0.05)' }}>
              <td style={{ color: '#06d6a0', fontWeight: 700 }}>📊 合计</td>
              <td style={{ color: '#f8fafc', fontWeight: 600 }}>¥{totals.revenue.toLocaleString()}</td>
              <td style={{ color: '#f87171', fontWeight: 600 }}>¥{totals.laborCost.toLocaleString()}</td>
              <td style={{ color: '#fbbf24', fontWeight: 600 }}>¥{totals.travelExpense.toLocaleString()}</td>
              <td>
                <span style={{ color: totals.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '1rem' }}>
                  ¥{totals.grossProfit.toLocaleString()}
                </span>
              </td>
              <td><MarginBadge margin={totalMargin} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
