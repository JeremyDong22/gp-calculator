// v1.0 - 现金收款表模块
// 功能：记录项目收款情况，仅部门负责人可见
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f8fafc',
  fontSize: '0.875rem',
};

export function CashReceiptPanel() {
  const { isDepartmentHead } = useAuth();
  const { cashReceipts, projects, addCashReceipt } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', date: '', amount: '', remark: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashReceipt({ projectId: form.projectId, date: form.date, amount: Number(form.amount), remark: form.remark });
    setForm({ projectId: '', date: '', amount: '', remark: '' });
    setShowForm(false);
  };

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.projectName || '-';

  const totalReceived = cashReceipts.reduce((sum, r) => sum + r.amount, 0);

  const exportToExcel = () => {
    const headers = ['日期', '项目', '金额', '备注'];
    const rows = cashReceipts.map(r => [r.date, getProjectName(r.projectId), r.amount, r.remark || '']);
    rows.push(['合计', '', totalReceived, '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `现金收款表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限查看现金收款表</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>💵 现金收款表</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            {showForm ? '取消' : '+ 新增收款'}
          </button>
          <button onClick={exportToExcel} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer'
          }}>
            📥 导出
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={cardStyle}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>💰 累计收款</div>
        <div style={{ color: '#34d399', fontSize: '1.5rem', fontWeight: 700 }}>¥{totalReceived.toLocaleString()}</div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>项目</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">选择项目</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>日期</label>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>金额</label>
              <input type="number" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>备注</label>
              <input type="text" style={inputStyle} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            添加收款
          </button>
        </form>
      )}

      <div style={{ ...cardStyle, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>日期</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>项目</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>金额</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {cashReceipts.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{r.date}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{getProjectName(r.projectId)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>¥{r.amount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>{r.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
