// v2.1 - Premium expense panel with glass cards and file upload + responsive layout
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { projects, users } from '../data/mockData';
import type { ExpenseEntry } from '../types';

const categories: ExpenseEntry['category'][] = ['住宿', '餐饮', '打车', '高铁', '机票', '其他'];
const categoryIcons: Record<string, string> = {
  '住宿': '🏨', '餐饮': '🍽️', '打车': '🚕', '高铁': '🚄', '机票': '✈️', '其他': '📦'
};

export function ExpensePanel() {
  const { currentUser } = useAuth();
  const { expenses, addExpense, updateExpenseStatus } = useData();
  const [form, setForm] = useState({ projectId: '', date: '', category: '' as ExpenseEntry['category'], amount: '', description: '', receiptUrl: '' });

  const isLeader = currentUser?.role === 'leader';
  const visibleExpenses = isLeader ? expenses : expenses.filter(e => e.userId === currentUser?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, receiptUrl: URL.createObjectURL(file) });
    }
  };

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
      receiptUrl: form.receiptUrl || '/no-receipt.jpg',
    });
    setForm({ projectId: '', date: '', category: '' as ExpenseEntry['category'], amount: '', description: '', receiptUrl: '' });
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, { bg: string; color: string; border: string; label: string }> = {
      pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', label: '⏳ 待审核' },
      approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)', label: '✓ 已批准' },
      rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)', label: '✗ 已拒绝' },
    };
    const s = styles[status];
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
          ✈️ 差旅报销
        </h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          {isLeader ? '审核团队成员的差旅费用' : '提交您的差旅费用报销申请'}
        </p>
      </div>

      {/* Form for employees */}
      {!isLeader && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(26, 34, 52, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                项目
              </label>
              <select
                value={form.projectId}
                onChange={e => setForm({ ...form, projectId: e.target.value })}
                required
                style={{ width: '100%' }}
              >
                <option value="">选择项目</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                日期
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                费用类型
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as ExpenseEntry['category'] })}
                required
                style={{ width: '100%' }}
              >
                <option value="">选择类型</option>
                {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                金额 (元)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                min="0"
                step="0.01"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                说明
              </label>
              <input
                type="text"
                placeholder="费用说明"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                上传凭证
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
              color: '#0a0e17',
              fontWeight: 600,
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(6, 214, 160, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            提交报销
          </button>
        </form>
      )}

      {/* Table */}
      <div style={{
        background: 'rgba(26, 34, 52, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '16px',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              <th>日期</th>
              <th>员工</th>
              <th>项目</th>
              <th>类型</th>
              <th>金额</th>
              <th>说明</th>
              <th>凭证</th>
              <th>状态</th>
              {isLeader && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {visibleExpenses.map(exp => (
              <tr key={exp.id}>
                <td style={{ color: '#f8fafc', fontWeight: 500 }}>{exp.date}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #06d6a0, #10b981)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'white',
                    }}>
                      {getUser(exp.userId)?.name.charAt(0)}
                    </div>
                    {getUser(exp.userId)?.name}
                  </div>
                </td>
                <td>{getProject(exp.projectId)?.name}</td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(124, 58, 237, 0.15)',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                  }}>
                    {categoryIcons[exp.category]} {exp.category}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>¥{exp.amount.toLocaleString()}</span>
                </td>
                <td>{exp.description}</td>
                <td>
                  {exp.receiptUrl && (
                    <a
                      href={exp.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#06d6a0',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      📎 查看
                    </a>
                  )}
                </td>
                <td><StatusBadge status={exp.status} /></td>
                {isLeader && (
                  <td>
                    {exp.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateExpenseStatus(exp.id, 'approved')}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          批准
                        </button>
                        <button
                          onClick={() => updateExpenseStatus(exp.id, 'rejected')}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
