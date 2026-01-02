// v1.0 - 部门利润表模块
// 功能：汇总部门整体利润情况，仅部门负责人可见
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

export function DepartmentProfitPanel() {
  const { isDepartmentHead } = useAuth();
  const { timesheets, expenses, projects, users, cashReceipts } = useData();

  const profitData = useMemo(() => {
    // 总收入（合同金额）
    const totalContractAmount = projects.reduce((sum, p) => sum + p.contractAmount, 0);
    // 总收款
    const totalReceived = cashReceipts.reduce((sum, r) => sum + r.amount, 0);
    // 总收入（确认收入）
    const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);

    // 人工成本
    const approvedTimesheets = timesheets.filter(t => t.status === 'approved');
    const totalLaborCost = approvedTimesheets.reduce((sum, t) => {
      const user = users.find(u => u.id === t.userId);
      return sum + (t.hours * (user?.hourlyRate || 0));
    }, 0);

    // 差旅费
    const approvedExpenses = expenses.filter(e => e.status === 'approved');
    const totalTravelExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 毛利
    const grossProfit = totalRevenue - totalLaborCost - totalTravelExpense;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 应收账款
    const accountsReceivable = totalContractAmount - totalReceived;

    return {
      totalContractAmount,
      totalReceived,
      totalRevenue,
      totalLaborCost,
      totalTravelExpense,
      grossProfit,
      grossMargin,
      accountsReceivable,
      projectCount: projects.length,
      employeeCount: users.filter(u => u.role === 'employee' || u.role === 'intern').length,
    };
  }, [timesheets, expenses, projects, users, cashReceipts]);

  const exportToExcel = () => {
    const rows = [
      ['部门利润表', ''],
      ['', ''],
      ['项目数量', profitData.projectCount],
      ['员工数量', profitData.employeeCount],
      ['', ''],
      ['合同总额', profitData.totalContractAmount],
      ['已收款', profitData.totalReceived],
      ['应收账款', profitData.accountsReceivable],
      ['', ''],
      ['确认收入', profitData.totalRevenue],
      ['人工成本', profitData.totalLaborCost],
      ['差旅费用', profitData.totalTravelExpense],
      ['', ''],
      ['毛利', profitData.grossProfit],
      ['毛利率', `${profitData.grossMargin.toFixed(1)}%`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `部门利润表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限查看部门利润表</p></div>;
  }

  const StatCard = ({ icon, label, value, subValue, color }: { icon: string; label: string; value: string; subValue?: string; color: string }) => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{label}</span>
      </div>
      <div style={{ color, fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
      {subValue && <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.25rem' }}>{subValue}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>📋 部门利润表</h2>
        <button onClick={exportToExcel} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          📥 导出Excel
        </button>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <StatCard icon="📁" label="项目数量" value={`${profitData.projectCount} 个`} color="#f8fafc" />
        <StatCard icon="👥" label="员工数量" value={`${profitData.employeeCount} 人`} color="#f8fafc" />
      </div>

      {/* Revenue Section */}
      <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>💰 收入情况</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard icon="📝" label="合同总额" value={`¥${profitData.totalContractAmount.toLocaleString()}`} color="#818cf8" />
        <StatCard icon="✅" label="已收款" value={`¥${profitData.totalReceived.toLocaleString()}`} color="#34d399" />
        <StatCard icon="⏳" label="应收账款" value={`¥${profitData.accountsReceivable.toLocaleString()}`} color="#fbbf24" />
        <StatCard icon="💵" label="确认收入" value={`¥${profitData.totalRevenue.toLocaleString()}`} color="#f8fafc" />
      </div>

      {/* Cost Section */}
      <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>📉 成本情况</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard
          icon="👥"
          label="人工成本"
          value={`¥${profitData.totalLaborCost.toLocaleString()}`}
          subValue={`占收入 ${profitData.totalRevenue > 0 ? ((profitData.totalLaborCost / profitData.totalRevenue) * 100).toFixed(1) : 0}%`}
          color="#f87171"
        />
        <StatCard
          icon="✈️"
          label="差旅费用"
          value={`¥${profitData.totalTravelExpense.toLocaleString()}`}
          subValue={`占收入 ${profitData.totalRevenue > 0 ? ((profitData.totalTravelExpense / profitData.totalRevenue) * 100).toFixed(1) : 0}%`}
          color="#fbbf24"
        />
      </div>

      {/* Profit Section */}
      <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>📈 利润情况</h3>
      <div style={{ ...cardStyle, background: profitData.grossProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>部门毛利</div>
            <div style={{ color: profitData.grossProfit >= 0 ? '#34d399' : '#f87171', fontSize: '2rem', fontWeight: 700 }}>
              ¥{profitData.grossProfit.toLocaleString()}
            </div>
          </div>
          <div style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: profitData.grossMargin >= 30 ? 'rgba(16, 185, 129, 0.2)' : profitData.grossMargin >= 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: profitData.grossMargin >= 30 ? '#34d399' : profitData.grossMargin >= 0 ? '#fbbf24' : '#f87171',
          }}>
            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>毛利率</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profitData.grossMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
