// v3.1 - 差旅报销模块
// 更新：三级审批流程（员工确认→执行负责人→部门负责人）、使用projectShortName
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { ExpenseEntry, ExpenseCategory } from '../types';

const categories: ExpenseCategory[] = ['高铁', '飞机', '打车', '公交', '餐费', '住宿', '其他'];
const categoryIcons: Record<string, string> = {
  '高铁': '🚄', '飞机': '✈️', '打车': '🚕', '公交': '🚌', '餐费': '🍽️', '住宿': '🏨', '其他': '📦'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
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

export function ExpensePanel() {
  const { currentUser, isDepartmentHead, isProjectManager, isSecretary } = useAuth();
  const { expenses, projects, users, addExpense, updateExpenseStatus } = useData();
  const [form, setForm] = useState({
    projectId: '',
    date: '',
    category: '' as ExpenseCategory,
    amount: '',
    description: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  const canApprove = isDepartmentHead || isProjectManager || isSecretary;
  const isEmployee = currentUser?.role === 'employee' || currentUser?.role === 'intern';

  // 可见费用记录
  const visibleExpenses = useMemo(() => {
    if (isDepartmentHead) return expenses;
    if (isProjectManager || isSecretary) {
      return expenses.filter(e => {
        const user = users.find(u => u.id === e.userId);
        return e.userId === currentUser?.id || user?.role === 'employee' || user?.role === 'intern';
      });
    }
    return expenses.filter(e => e.userId === currentUser?.id);
  }, [expenses, currentUser, isDepartmentHead, isProjectManager, isSecretary, users]);

  // 按项目-人-类型分组
  const groupedExpenses = useMemo(() => {
    const grouped: Record<string, Record<string, Record<string, ExpenseEntry[]>>> = {};
    visibleExpenses.forEach(e => {
      const projectName = projects.find(p => p.id === e.projectId)?.projectShortName || '未知项目';
      const userName = users.find(u => u.id === e.userId)?.name || '未知';
      if (!grouped[projectName]) grouped[projectName] = {};
      if (!grouped[projectName][userName]) grouped[projectName][userName] = {};
      if (!grouped[projectName][userName][e.category]) grouped[projectName][userName][e.category] = [];
      grouped[projectName][userName][e.category].push(e);
    });
    return grouped;
  }, [visibleExpenses, projects, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.projectId || !form.date || !form.category || !form.amount) return;
    addExpense({
      userId: currentUser.id,
      projectId: form.projectId,
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
    });
    setForm({ projectId: '', date: '', category: '' as ExpenseCategory, amount: '', description: '' });
  };

  // 审批逻辑：员工确认 → 执行负责人审核 → 部门负责人审核
  const handleApprove = (exp: ExpenseEntry) => {
    if (exp.status === 'pending' && exp.userId === currentUser?.id) {
      updateExpenseStatus(exp.id, 'user_confirmed');
    } else if (exp.status === 'user_confirmed' && isProjectManager) {
      updateExpenseStatus(exp.id, 'executor_approved');
    } else if (exp.status === 'executor_approved' && isDepartmentHead) {
      updateExpenseStatus(exp.id, 'approved');
    } else if (isDepartmentHead) {
      // 部门负责人可以直接批准任何状态
      updateExpenseStatus(exp.id, 'approved');
    }
  };

  const canApproveThis = (exp: ExpenseEntry) => {
    if (exp.status === 'pending' && exp.userId === currentUser?.id) return true;
    if (exp.status === 'user_confirmed' && isProjectManager) return true;
    if (exp.status === 'executor_approved' && isDepartmentHead) return true;
    if (isDepartmentHead && exp.status !== 'approved' && exp.status !== 'rejected') return true;
    return false;
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  const StatusBadge = ({ status }: { status: ExpenseEntry['status'] }) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', label: '待员工确认' },
      user_confirmed: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: '待执行负责人审批' },
      executor_approved: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', label: '待部门负责人审批' },
      approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: '✓ 已批准' },
      rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: '✗ 已拒绝' },
    };
    const s = styles[status];
    return (
      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>✈️ 差旅报销</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {canApprove ? '三级审批：员工确认 → 执行负责人 → 部门负责人' : '提交差旅费用报销申请'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setViewMode('list')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'list' ? 'linear-gradient(135deg, #06d6a0, #118ab2)' : 'rgba(148, 163, 184, 0.1)',
            color: viewMode === 'list' ? 'white' : '#94a3b8',
          }}>列表</button>
          <button onClick={() => setViewMode('grouped')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'grouped' ? 'linear-gradient(135deg, #06d6a0, #118ab2)' : 'rgba(148, 163, 184, 0.1)',
            color: viewMode === 'grouped' ? 'white' : '#94a3b8',
          }}>分组</button>
        </div>
      </div>

      {/* 填报表单 */}
      {isEmployee && (
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>项目</label>
              <select style={inputStyle} value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">选择</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectShortName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>报销日期</label>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>费用类型</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })} required>
                <option value="">选择</option>
                {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>金额</label>
              <input type="number" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} min="0" step="0.01" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>说明</label>
              <input type="text" style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="费用说明" />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '0.75rem', padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', fontWeight: 500, cursor: 'pointer',
          }}>
            提交报销
          </button>
        </form>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          overflow: 'auto',
          maxHeight: '70vh',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={thStyle}>报销日期</th>
                <th style={thStyle}>员工</th>
                <th style={thStyle}>项目</th>
                <th style={thStyle}>类型</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>金额</th>
                <th style={thStyle}>说明</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>状态</th>
                {canApprove && <th style={{ ...thStyle, textAlign: 'center' }}>操作</th>}
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{exp.date}</td>
                  <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{getUser(exp.userId)?.name}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{getProject(exp.projectId)?.projectShortName}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      {categoryIcons[exp.category]} {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f8fafc', fontWeight: 600 }}>¥{exp.amount.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>{exp.description || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}><StatusBadge status={exp.status} /></td>
                  {canApprove && (
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {canApproveThis(exp) && (
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button onClick={() => handleApprove(exp)} style={{
                            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          }}>批准</button>
                          <button onClick={() => updateExpenseStatus(exp.id, 'rejected')} style={{
                            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          }}>拒绝</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分组视图 */}
      {viewMode === 'grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(groupedExpenses).map(([projectName, userGroups]) => (
            <div key={projectName} style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: '1rem',
            }}>
              <h3 style={{ color: '#06d6a0', fontSize: '1rem', marginBottom: '0.75rem' }}>📁 {projectName}</h3>
              {Object.entries(userGroups).map(([userName, categoryGroups]) => (
                <div key={userName} style={{ marginLeft: '1rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.875rem', marginBottom: '0.5rem' }}>👤 {userName}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginLeft: '1rem' }}>
                    {Object.entries(categoryGroups).map(([category, items]) => {
                      const total = items.reduce((sum, e) => sum + e.amount, 0);
                      return (
                        <div key={category} style={{
                          background: 'rgba(124, 58, 237, 0.1)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                        }}>
                          <span>{categoryIcons[category]} {category}: </span>
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>¥{total.toLocaleString()}</span>
                          <span style={{ color: '#64748b' }}> ({items.length}笔)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
