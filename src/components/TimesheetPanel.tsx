// v2.1 - Premium timesheet panel with glass cards + responsive layout
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { projects, users } from '../data/mockData';

export function TimesheetPanel() {
  const { currentUser } = useAuth();
  const { timesheets, addTimesheet, updateTimesheetStatus } = useData();
  const [form, setForm] = useState({ projectId: '', date: '', hours: '', description: '' });

  const isLeader = currentUser?.role === 'leader';
  const visibleTimesheets = isLeader
    ? timesheets
    : timesheets.filter(t => t.userId === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.projectId || !form.date || !form.hours) return;
    addTimesheet({
      userId: currentUser.id,
      projectId: form.projectId,
      date: form.date,
      hours: Number(form.hours),
      description: form.description,
    });
    setForm({ projectId: '', date: '', hours: '', description: '' });
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
          ⏱️ 工时填报
        </h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          {isLeader ? '审核团队成员的工时记录' : '记录您在各项目上的工作时间'}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                工时 (小时)
              </label>
              <input
                type="number"
                placeholder="8"
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
                min="0.5"
                max="24"
                step="0.5"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                工作描述
              </label>
              <input
                type="text"
                placeholder="简要描述工作内容"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%' }}
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
            提交工时
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
        <table style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>日期</th>
              <th>员工</th>
              <th>项目</th>
              <th>工时</th>
              <th>描述</th>
              <th>状态</th>
              {isLeader && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {visibleTimesheets.map(t => (
              <tr key={t.id}>
                <td style={{ color: '#f8fafc', fontWeight: 500 }}>{t.date}</td>
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
                      {getUser(t.userId)?.name.charAt(0)}
                    </div>
                    {getUser(t.userId)?.name}
                  </div>
                </td>
                <td>{getProject(t.projectId)?.name}</td>
                <td>
                  <span style={{
                    color: '#06d6a0',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}>
                    {t.hours}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>h</span>
                </td>
                <td>{t.description}</td>
                <td><StatusBadge status={t.status} /></td>
                {isLeader && (
                  <td>
                    {t.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateTimesheetStatus(t.id, 'approved')}
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
                          onClick={() => updateTimesheetStatus(t.id, 'rejected')}
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
