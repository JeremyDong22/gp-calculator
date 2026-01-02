// v3.0 - 项目毛利分析模块
// 更新：人工成本率、差旅费率、截止日期筛选、Excel导出
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { ProjectGrossProfit } from '../types';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

export function GrossProfitDashboard() {
  const { timesheets, expenses, projects, users } = useData();
  const [cutoffDate, setCutoffDate] = useState('');

  const calculateGP = useMemo((): ProjectGrossProfit[] => {
    return projects.map(project => {
      const approvedTimesheets = timesheets.filter(t =>
        t.projectId === project.id &&
        t.status === 'approved' &&
        (!cutoffDate || t.date <= cutoffDate)
      );
      const laborCost = approvedTimesheets.reduce((sum, t) => {
        const user = users.find(u => u.id === t.userId);
        return sum + (t.hours * (user?.hourlyRate || 0));
      }, 0);

      const approvedExpenses = expenses.filter(e =>
        e.projectId === project.id &&
        e.status === 'approved' &&
        (!cutoffDate || e.date <= cutoffDate)
      );
      const travelExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

      const grossProfit = project.revenue - laborCost - travelExpense;
      const margin = project.revenue > 0 ? (grossProfit / project.revenue) * 100 : 0;
      const laborCostRate = project.revenue > 0 ? (laborCost / project.revenue) * 100 : 0;
      const travelExpenseRate = project.revenue > 0 ? (travelExpense / project.revenue) * 100 : 0;

      return { projectId: project.id, revenue: project.revenue, laborCost, travelExpense, grossProfit, margin, laborCostRate, travelExpenseRate };
    });
  }, [timesheets, expenses, projects, users, cutoffDate]);

  const getProject = (id: string) => projects.find(p => p.id === id);

  const totals = calculateGP.reduce((acc, gp) => ({
    revenue: acc.revenue + gp.revenue,
    laborCost: acc.laborCost + gp.laborCost,
    travelExpense: acc.travelExpense + gp.travelExpense,
    grossProfit: acc.grossProfit + gp.grossProfit,
  }), { revenue: 0, laborCost: 0, travelExpense: 0, grossProfit: 0 });

  const totalMargin = totals.revenue > 0 ? (totals.grossProfit / totals.revenue) * 100 : 0;
  const totalLaborRate = totals.revenue > 0 ? (totals.laborCost / totals.revenue) * 100 : 0;
  const totalTravelRate = totals.revenue > 0 ? (totals.travelExpense / totals.revenue) * 100 : 0;

  const exportToExcel = () => {
    const headers = ['项目名称', '收入', '人工成本', '人工成本率', '差旅费', '差旅费率', '毛利', '毛利率'];
    const rows = calculateGP.map(gp => [
      getProject(gp.projectId)?.projectName || '',
      gp.revenue,
      gp.laborCost,
      `${gp.laborCostRate?.toFixed(1)}%`,
      gp.travelExpense,
      `${gp.travelExpenseRate?.toFixed(1)}%`,
      gp.grossProfit,
      `${gp.margin.toFixed(1)}%`,
    ]);
    rows.push(['合计', totals.revenue, totals.laborCost, `${totalLaborRate.toFixed(1)}%`, totals.travelExpense, `${totalTravelRate.toFixed(1)}%`, totals.grossProfit, `${totalMargin.toFixed(1)}%`]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `项目毛利分析_${cutoffDate || new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const MarginBadge = ({ margin }: { margin: number }) => {
    const config = margin >= 30
      ? { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }
      : margin >= 0
      ? { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }
      : { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
    return (
      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: config.bg, color: config.color }}>
        {margin.toFixed(1)}%
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>📊 项目毛利分析</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>仅计算已审核通过的工时和差旅费</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="date"
            value={cutoffDate}
            onChange={e => setCutoffDate(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#f8fafc',
              fontSize: '0.875rem',
            }}
            placeholder="截止日期"
          />
          <button onClick={exportToExcel} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            📥 导出Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>💰 总收入</div>
          <div style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.revenue.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>👥 人工成本</div>
          <div style={{ color: '#f87171', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.laborCost.toLocaleString()}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>占比 {totalLaborRate.toFixed(1)}%</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>✈️ 差旅费</div>
          <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.travelExpense.toLocaleString()}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>占比 {totalTravelRate.toFixed(1)}%</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>📈 总毛利</div>
          <div style={{ color: totals.grossProfit >= 0 ? '#34d399' : '#f87171', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.grossProfit.toLocaleString()}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>毛利率 {totalMargin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>项目</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>收入</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>人工成本</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>人工成本率</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>差旅费</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>差旅费率</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>毛利</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>毛利率</th>
            </tr>
          </thead>
          <tbody>
            {calculateGP.map(gp => (
              <tr key={gp.projectId} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{getProject(gp.projectId)?.projectName}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f8fafc' }}>¥{gp.revenue.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>¥{gp.laborCost.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8' }}>{gp.laborCostRate?.toFixed(1)}%</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24' }}>¥{gp.travelExpense.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8' }}>{gp.travelExpenseRate?.toFixed(1)}%</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: gp.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>¥{gp.grossProfit.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}><MarginBadge margin={gp.margin} /></td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(6, 214, 160, 0.05)' }}>
              <td style={{ padding: '0.75rem', color: '#06d6a0', fontWeight: 700 }}>📊 合计</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f8fafc', fontWeight: 600 }}>¥{totals.revenue.toLocaleString()}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.laborCost.toLocaleString()}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>{totalLaborRate.toFixed(1)}%</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>¥{totals.travelExpense.toLocaleString()}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>{totalTravelRate.toFixed(1)}%</td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: totals.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>¥{totals.grossProfit.toLocaleString()}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}><MarginBadge margin={totalMargin} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
