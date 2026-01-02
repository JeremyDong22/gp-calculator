// v1.0 - 奖金计算表模块
// 功能：计算项目工资包，仅部门负责人可见
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 0.5rem',
  textAlign: 'left',
  color: '#94a3b8',
  fontSize: '0.75rem',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  background: 'rgba(30, 41, 59, 0.95)',
  zIndex: 10,
};

type BonusRow = {
  projectId: string;
  projectName: string;
  confirmedReceipt: number;
  laborCost: number;
  grossProfit: number;
  salaryRatio: number;
  salaryAmount: number;
  travelExpense: number;
  actualSalary: number;
};

export function BonusCalculationPanel() {
  const { isDepartmentHead } = useAuth();
  const { projects, cashReceipts, timesheets, expenses, users } = useData();
  const [salaryRatios, setSalaryRatios] = useState<Record<string, number>>({});

  const bonusData = useMemo((): BonusRow[] => {
    return projects.map(project => {
      // Column 2: 部门确认的收款
      const receipts = cashReceipts.filter(r => r.projectId === project.id);
      const confirmedReceipt = receipts.reduce((sum, r) => sum + r.confirmedReceipt, 0);

      // Column 3: 人工总费用 = daily rate × cumulative days
      const approvedTimesheets = timesheets.filter(t =>
        t.projectId === project.id && t.status === 'approved'
      );
      const laborCost = approvedTimesheets.reduce((sum, t) => {
        const user = users.find(u => u.id === t.userId);
        return sum + (t.totalHours * (user?.dailyRate || 0)) / 8;
      }, 0);

      // Column 4: 项目毛利
      const grossProfit = confirmedReceipt - laborCost;

      // Column 5: 工资包计算比例
      const salaryRatio = salaryRatios[project.id] || 0;

      // Column 6: 工资包金额
      const salaryAmount = grossProfit * salaryRatio;

      // Column 7: 差旅费
      const approvedExpenses = expenses.filter(e =>
        e.projectId === project.id && e.status === 'approved'
      );
      const travelExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Column 8: 实际收到工资包
      const actualSalary = salaryAmount - travelExpense;

      return {
        projectId: project.id,
        projectName: project.projectShortName,
        confirmedReceipt,
        laborCost,
        grossProfit,
        salaryRatio,
        salaryAmount,
        travelExpense,
        actualSalary,
      };
    });
  }, [projects, cashReceipts, timesheets, expenses, users, salaryRatios]);

  const totals = bonusData.reduce((acc, row) => ({
    confirmedReceipt: acc.confirmedReceipt + row.confirmedReceipt,
    laborCost: acc.laborCost + row.laborCost,
    grossProfit: acc.grossProfit + row.grossProfit,
    salaryAmount: acc.salaryAmount + row.salaryAmount,
    travelExpense: acc.travelExpense + row.travelExpense,
    actualSalary: acc.actualSalary + row.actualSalary,
  }), { confirmedReceipt: 0, laborCost: 0, grossProfit: 0, salaryAmount: 0, travelExpense: 0, actualSalary: 0 });

  const handleRatioChange = (projectId: string, value: string) => {
    const ratio = parseFloat(value) || 0;
    setSalaryRatios(prev => ({ ...prev, [projectId]: ratio }));
  };

  const exportToExcel = () => {
    const headers = ['项目名称', '部门确认收款', '人工总费用', '项目毛利', '工资包计算比例', '工资包金额', '差旅费', '实际收到工资包'];
    const rows = bonusData.map(r => [
      r.projectName,
      r.confirmedReceipt,
      r.laborCost.toFixed(2),
      r.grossProfit.toFixed(2),
      r.salaryRatio,
      r.salaryAmount.toFixed(2),
      r.travelExpense,
      r.actualSalary.toFixed(2),
    ]);
    rows.push(['合计', totals.confirmedReceipt, totals.laborCost.toFixed(2), totals.grossProfit.toFixed(2), '', totals.salaryAmount.toFixed(2), totals.travelExpense, totals.actualSalary.toFixed(2)]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `奖金计算表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限查看奖金计算表</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>💰 奖金计算表</h2>
        <button onClick={exportToExcel} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          📥 导出Excel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>💰 部门确认收款</div>
          <div style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.confirmedReceipt.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>👥 人工总费用</div>
          <div style={{ color: '#f87171', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.laborCost.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>📈 项目毛利</div>
          <div style={{ color: totals.grossProfit >= 0 ? '#34d399' : '#f87171', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.grossProfit.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>💼 工资包金额</div>
          <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.salaryAmount.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>✈️ 差旅费</div>
          <div style={{ color: '#f87171', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.travelExpense.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>✅ 实际工资包</div>
          <div style={{ color: '#06d6a0', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.actualSalary.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th style={thStyle}>项目名称</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>部门确认收款</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>人工总费用</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>项目毛利</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>工资包计算比例</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>工资包金额</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>差旅费</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>实际收到工资包</th>
            </tr>
          </thead>
          <tbody>
            {bonusData.map(row => (
              <tr key={row.projectId} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontSize: '0.875rem' }}>{row.projectName}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f8fafc' }}>¥{row.confirmedReceipt.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171' }}>¥{row.laborCost.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: row.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>¥{row.grossProfit.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={row.salaryRatio}
                    onChange={e => handleRatioChange(row.projectId, e.target.value)}
                    style={{
                      width: '80px',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      color: '#f8fafc',
                      fontSize: '0.8125rem',
                      textAlign: 'center',
                    }}
                  />
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>¥{row.salaryAmount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171' }}>¥{row.travelExpense.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#06d6a0', fontWeight: 600 }}>¥{row.actualSalary.toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(6, 214, 160, 0.05)' }}>
              <td style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontWeight: 700 }}>📊 合计</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f8fafc', fontWeight: 600 }}>¥{totals.confirmedReceipt.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.laborCost.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: totals.grossProfit >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>¥{totals.grossProfit.toLocaleString()}</td>
              <td></td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>¥{totals.salaryAmount.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.travelExpense.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#06d6a0', fontWeight: 700 }}>¥{totals.actualSalary.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
