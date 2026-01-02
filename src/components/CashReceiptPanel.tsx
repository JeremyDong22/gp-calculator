// v3.3 - 现金收款表模块
// 更新：添加按执行负责人汇总表
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

const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f8fafc',
  fontSize: '0.8125rem',
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

export function CashReceiptPanel() {
  const { canViewCashReceipt, isDepartmentHead, isExecutionLeaderOf } = useAuth();
  const { cashReceipts, projects, users, addCashReceipt, updateCashReceipt } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    receiptDate: '',
    financeReceipt: '',
    confirmedReceipt: '',
    developmentSplit: '',
    departmentSplit: '',
    otherSplit: '',
    invoiceDate: '',
    remark: '',
  });

  // 获取项目信息
  const getProject = (id: string) => projects.find(p => p.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = getProject(form.projectId);
    const confirmedReceipt = Number(form.confirmedReceipt) || 0;
    const developmentSplit = Number(form.developmentSplit) || 0;
    const departmentSplit = Number(form.departmentSplit) || 0;
    const otherSplit = Number(form.otherSplit) || 0;

    addCashReceipt({
      projectId: form.projectId,
      receiptDate: form.receiptDate,
      payer: project?.payer || '',
      executionLeaderId: project?.executionLeaderId || '',
      financeReceipt: Number(form.financeReceipt) || 0,
      confirmedReceipt,
      developmentSplit,
      departmentSplit,
      otherSplit,
      invoiceDate: form.invoiceDate || undefined,
      remark: form.remark,
    });
    setForm({ projectId: '', receiptDate: '', financeReceipt: '', confirmedReceipt: '', developmentSplit: '', departmentSplit: '', otherSplit: '', invoiceDate: '', remark: '' });
    setShowForm(false);
  };

  // 汇总统计
  const totals = useMemo(() => {
    return cashReceipts.reduce((acc, r) => ({
      financeReceipt: acc.financeReceipt + r.financeReceipt,
      confirmedReceipt: acc.confirmedReceipt + r.confirmedReceipt,
      developmentSplit: acc.developmentSplit + r.developmentSplit,
      departmentSplit: acc.departmentSplit + r.departmentSplit,
      otherSplit: acc.otherSplit + r.otherSplit,
      adjustedReceipt: acc.adjustedReceipt + r.adjustedReceipt,
    }), { financeReceipt: 0, confirmedReceipt: 0, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 0 });
  }, [cashReceipts]);

  // 按执行负责人汇总
  const executorSummary = useMemo(() => {
    const summary = new Map<string, { name: string; financeReceipt: number; confirmedReceipt: number; developmentSplit: number; departmentSplit: number; otherSplit: number; adjustedReceipt: number }>();
    cashReceipts.forEach(r => {
      const executor = getUser(r.executionLeaderId);
      const project = getProject(r.projectId);
      const name = executor?.name || project?.executionLeaderName || '未知';
      const key = r.executionLeaderId || 'unknown';
      const existing = summary.get(key) || { name, financeReceipt: 0, confirmedReceipt: 0, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 0 };
      summary.set(key, {
        name,
        financeReceipt: existing.financeReceipt + r.financeReceipt,
        confirmedReceipt: existing.confirmedReceipt + r.confirmedReceipt,
        developmentSplit: existing.developmentSplit + r.developmentSplit,
        departmentSplit: existing.departmentSplit + r.departmentSplit,
        otherSplit: existing.otherSplit + r.otherSplit,
        adjustedReceipt: existing.adjustedReceipt + r.adjustedReceipt,
      });
    });
    return Array.from(summary.values());
  }, [cashReceipts, users, projects]);

  const exportToExcel = () => {
    const headers = ['收款日期', '项目简称', '付款方', '执行负责人', '财务收款', '部门确认收款', '开发拆分', '部门拆分', '其他拆分', '调整后收款', '开票日期', '备注'];
    const rows = cashReceipts.map(r => {
      const project = getProject(r.projectId);
      const executor = getUser(r.executionLeaderId);
      return [
        r.receiptDate,
        project?.projectShortName || '',
        r.payer,
        executor?.name || project?.executionLeaderName || '',
        r.financeReceipt,
        r.confirmedReceipt,
        r.developmentSplit,
        r.departmentSplit,
        r.otherSplit,
        r.adjustedReceipt,
        r.invoiceDate || '',
        r.remark || '',
      ];
    });
    rows.push(['合计', '', '', '', totals.financeReceipt, totals.confirmedReceipt, totals.developmentSplit, totals.departmentSplit, totals.otherSplit, totals.adjustedReceipt, '', '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `现金收款表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!canViewCashReceipt) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>您没有权限查看现金收款表</p></div>;
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

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>💰 财务收款</div>
          <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.financeReceipt.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>✅ 部门确认</div>
          <div style={{ color: '#06d6a0', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.confirmedReceipt.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>📊 调整后收款</div>
          <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 600 }}>¥{totals.adjustedReceipt.toLocaleString()}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>项目</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">选择</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectShortName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>收款日期</label>
              <input type="date" style={{ ...inputStyle, width: '100%' }} value={form.receiptDate} onChange={e => setForm({ ...form, receiptDate: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>财务收款</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={form.financeReceipt} onChange={e => setForm({ ...form, financeReceipt: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>部门确认收款</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={form.confirmedReceipt} onChange={e => setForm({ ...form, confirmedReceipt: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>开发拆分</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={form.developmentSplit} onChange={e => setForm({ ...form, developmentSplit: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>部门拆分</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={form.departmentSplit} onChange={e => setForm({ ...form, departmentSplit: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>其他拆分</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={form.otherSplit} onChange={e => setForm({ ...form, otherSplit: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>开票日期</label>
              <input type="date" style={{ ...inputStyle, width: '100%' }} value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>备注</label>
              <input type="text" style={{ ...inputStyle, width: '100%' }} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '0.75rem', padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            添加收款
          </button>
        </form>
      )}

      <div style={{ ...cardStyle, overflow: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th style={thStyle}>收款日期</th>
              <th style={thStyle}>项目简称</th>
              <th style={thStyle}>付款方</th>
              <th style={thStyle}>执行负责人</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>财务收款</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>部门确认</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>开发拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>部门拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>其他拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>调整后收款</th>
              <th style={thStyle}>开票日期</th>
              <th style={thStyle}>备注</th>
            </tr>
          </thead>
          <tbody>
            {cashReceipts.map(r => {
              const project = getProject(r.projectId);
              const executor = getUser(r.executionLeaderId);
              const isExecLead = isExecutionLeaderOf(r.projectId, projects);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>{r.receiptDate}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontSize: '0.875rem' }}>{project?.projectShortName || '-'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>{r.payer}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>{executor?.name || project?.executionLeaderName || '-'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {isDepartmentHead ? (
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px', textAlign: 'right', color: '#3b82f6' }}
                        value={r.financeReceipt}
                        onChange={e => updateCashReceipt(r.id, { financeReceipt: Number(e.target.value) })}
                      />
                    ) : (
                      <span style={{ color: '#3b82f6' }}>¥{r.financeReceipt.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {isExecLead ? (
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px', textAlign: 'right', color: '#06d6a0' }}
                        value={r.confirmedReceipt}
                        onChange={e => updateCashReceipt(r.id, { confirmedReceipt: Number(e.target.value) })}
                      />
                    ) : (
                      <span style={{ color: '#06d6a0' }}>¥{r.confirmedReceipt.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {isDepartmentHead ? (
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px', textAlign: 'right', color: '#f87171' }}
                        value={r.developmentSplit}
                        onChange={e => updateCashReceipt(r.id, { developmentSplit: Number(e.target.value) })}
                      />
                    ) : (
                      <span style={{ color: '#f87171' }}>¥{r.developmentSplit.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {isDepartmentHead ? (
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px', textAlign: 'right', color: '#f87171' }}
                        value={r.departmentSplit}
                        onChange={e => updateCashReceipt(r.id, { departmentSplit: Number(e.target.value) })}
                      />
                    ) : (
                      <span style={{ color: '#f87171' }}>¥{r.departmentSplit.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {isDepartmentHead ? (
                      <input
                        type="number"
                        style={{ ...inputStyle, width: '100px', textAlign: 'right', color: '#f87171' }}
                        value={r.otherSplit}
                        onChange={e => updateCashReceipt(r.id, { otherSplit: Number(e.target.value) })}
                      />
                    ) : (
                      <span style={{ color: '#f87171' }}>¥{r.otherSplit.toLocaleString()}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>¥{r.adjustedReceipt.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>{r.invoiceDate || '-'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.875rem' }}>{r.remark || '-'}</td>
                </tr>
              );
            })}
            <tr style={{ background: 'rgba(6, 214, 160, 0.05)' }}>
              <td colSpan={4} style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontWeight: 700 }}>📊 合计</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#3b82f6', fontWeight: 600 }}>¥{totals.financeReceipt.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#06d6a0', fontWeight: 600 }}>¥{totals.confirmedReceipt.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.developmentSplit.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.departmentSplit.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>¥{totals.otherSplit.toLocaleString()}</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>¥{totals.adjustedReceipt.toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 按执行负责人汇总 */}
      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>👥 按执行负责人汇总</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>执行负责人</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>财务收款</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>部门确认</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>开发拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>部门拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>其他拆分</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>调整后收款</th>
            </tr>
          </thead>
          <tbody>
            {executorSummary.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>{s.name}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#3b82f6' }}>¥{s.financeReceipt.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#06d6a0' }}>¥{s.confirmedReceipt.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171' }}>¥{s.developmentSplit.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171' }}>¥{s.departmentSplit.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#f87171' }}>¥{s.otherSplit.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>¥{s.adjustedReceipt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
