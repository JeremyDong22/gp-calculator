// v1.0 - 员工奖金计算表模块
// 功能：基于项目毛利计算员工奖金，仅部门负责人可见
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

export function BonusCalculationPanel() {
  const { isDepartmentHead } = useAuth();
  const { timesheets, expenses, projects, users } = useData();

  const bonusData = useMemo(() => {
    return users.filter(u => u.role === 'employee' || u.role === 'intern').map(user => {
      const userTimesheets = timesheets.filter(t => t.userId === user.id && t.status === 'approved');
      const totalHours = userTimesheets.reduce((sum, t) => sum + t.hours, 0);
      const laborCost = totalHours * user.hourlyRate;

      // 计算参与项目的毛利贡献
      const projectContributions = projects.map(project => {
        const projectTimesheets = userTimesheets.filter(t => t.projectId === project.id);
        const projectHours = projectTimesheets.reduce((sum, t) => sum + t.hours, 0);
        if (projectHours === 0) return null;

        const totalProjectTimesheets = timesheets.filter(t => t.projectId === project.id && t.status === 'approved');
        const totalProjectHours = totalProjectTimesheets.reduce((sum, t) => sum + t.hours, 0);
        const totalProjectLaborCost = totalProjectTimesheets.reduce((sum, t) => {
          const u = users.find(usr => usr.id === t.userId);
          return sum + (t.hours * (u?.hourlyRate || 0));
        }, 0);

        const projectExpenses = expenses.filter(e => e.projectId === project.id && e.status === 'approved');
        const totalTravelExpense = projectExpenses.reduce((sum, e) => sum + e.amount, 0);

        const grossProfit = project.revenue - totalProjectLaborCost - totalTravelExpense;
        const contributionRatio = totalProjectHours > 0 ? projectHours / totalProjectHours : 0;
        const profitContribution = grossProfit * contributionRatio;

        return { projectName: project.projectName, hours: projectHours, contributionRatio, profitContribution };
      }).filter(Boolean);

      const totalProfitContribution = projectContributions.reduce((sum, p) => sum + (p?.profitContribution || 0), 0);
      const bonusRate = 0.1; // 10% 奖金率
      const bonus = Math.max(0, totalProfitContribution * bonusRate);

      return { user, totalHours, laborCost, projectContributions, totalProfitContribution, bonus };
    });
  }, [timesheets, expenses, projects, users]);

  const totalBonus = bonusData.reduce((sum, b) => sum + b.bonus, 0);

  const exportToExcel = () => {
    const headers = ['员工', '总工时', '人工成本', '毛利贡献', '奖金(10%)'];
    const rows = bonusData.map(b => [b.user.name, b.totalHours, b.laborCost, b.totalProfitContribution.toFixed(0), b.bonus.toFixed(0)]);
    rows.push(['合计', '', '', '', totalBonus.toFixed(0)]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `员工奖金计算表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限查看员工奖金计算表</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>🎁 员工奖金计算表</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>基于项目毛利贡献计算（奖金率10%）</p>
        </div>
        <button onClick={exportToExcel} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          📥 导出Excel
        </button>
      </div>

      {/* Summary */}
      <div style={cardStyle}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>🎁 总奖金池</div>
        <div style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: 700 }}>¥{totalBonus.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      </div>

      <div style={{ ...cardStyle, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>员工</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>总工时</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>人工成本</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>毛利贡献</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>奖金(10%)</th>
            </tr>
          </thead>
          <tbody>
            {bonusData.map(b => (
              <tr key={b.user.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'linear-gradient(135deg, #06d6a0, #10b981)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 600, color: 'white',
                    }}>
                      {b.user.name.charAt(0)}
                    </div>
                    <span style={{ color: '#f8fafc', fontSize: '0.875rem' }}>{b.user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#06d6a0', fontWeight: 600 }}>{b.totalHours}h</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171' }}>¥{b.laborCost.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: b.totalProfitContribution >= 0 ? '#34d399' : '#f87171' }}>
                  ¥{b.totalProfitContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>
                  ¥{b.bonus.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(251, 191, 36, 0.05)' }}>
              <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>🎁 合计</td>
              <td colSpan={3}></td>
              <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700, fontSize: '1rem' }}>
                ¥{totalBonus.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
