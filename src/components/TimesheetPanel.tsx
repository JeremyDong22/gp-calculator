// v3.0 - 工时填报模块
// 更新：支持多项目/多时段、工作地点、项目类型、费率和人工成本列（部门负责人可见）
// 限制：每天最多8小时，每周5天
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { TimesheetEntry } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f8fafc',
  fontSize: '0.8125rem',
};

export function TimesheetPanel() {
  const { currentUser, isDepartmentHead, isProjectManager } = useAuth();
  const { timesheets, projects, users, addTimesheet, updateTimesheetStatus } = useData();
  const [form, setForm] = useState({
    projectId: '',
    date: '',
    hours: '',
    location: '',
    projectType: '',
    period: 'morning' as 'morning' | 'afternoon' | 'evening',
  });

  const canApprove = isDepartmentHead || isProjectManager;

  // 可见工时记录：部门负责人看全部，项目负责人看自己+员工，其他只看自己
  const visibleTimesheets = useMemo(() => {
    if (isDepartmentHead) return timesheets;
    if (isProjectManager) {
      return timesheets.filter(t => {
        const user = users.find(u => u.id === t.userId);
        return t.userId === currentUser?.id || user?.role === 'employee' || user?.role === 'intern';
      });
    }
    return timesheets.filter(t => t.userId === currentUser?.id);
  }, [timesheets, currentUser, isDepartmentHead, isProjectManager, users]);

  // 检查当天工时是否超过8小时
  const getDayTotalHours = (date: string, userId: string) => {
    return timesheets
      .filter(t => t.date === date && t.userId === userId)
      .reduce((sum, t) => sum + t.hours, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.projectId || !form.date || !form.hours) return;

    const hours = Number(form.hours);
    const currentDayTotal = getDayTotalHours(form.date, currentUser.id);

    if (currentDayTotal + hours > 8) {
      alert(`当天已填报${currentDayTotal}小时，最多还能填报${8 - currentDayTotal}小时`);
      return;
    }

    addTimesheet({
      userId: currentUser.id,
      projectId: form.projectId,
      date: form.date,
      hours,
      location: form.location,
      projectType: form.projectType,
      period: form.period,
    });
    setForm({ projectId: '', date: '', hours: '', location: '', projectType: '', period: 'morning' });
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  const periodLabels = { morning: '上午', afternoon: '下午', evening: '晚上' };

  const StatusBadge = ({ status }: { status: TimesheetEntry['status'] }) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', label: '⏳ 待审核' },
      approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: '✓ 已批准' },
      rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: '✗ 已拒绝' },
    };
    const s = styles[status];
    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        background: s.bg,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>⏱️ 工时填报</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          {canApprove ? '审核团队成员的工时记录' : '每天最多8小时，每周5天'}
        </p>
      </div>

      {/* 填报表单 */}
      {!canApprove && (
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
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>日期</label>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>时段</label>
              <select style={inputStyle} value={form.period} onChange={e => setForm({ ...form, period: e.target.value as 'morning' | 'afternoon' | 'evening' })}>
                <option value="morning">上午</option>
                <option value="afternoon">下午</option>
                <option value="evening">晚上</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>工时</label>
              <input type="number" style={inputStyle} value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} min="0.5" max="8" step="0.5" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>工作地点</label>
              <input type="text" style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="北京" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>项目类型</label>
              <input type="text" style={inputStyle} value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })} placeholder="需求分析" />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
            color: 'white',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            提交工时
          </button>
        </form>
      )}

      {/* 工时列表 */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        overflow: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isDepartmentHead ? '1000px' : '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>日期</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>员工</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>项目</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>时段</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>工时</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>地点</th>
              {isDepartmentHead && <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>费率</th>}
              {isDepartmentHead && <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>人工成本</th>}
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>项目类型</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>状态</th>
              {canApprove && <th style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {visibleTimesheets.map(t => {
              const user = getUser(t.userId);
              const laborCost = (user?.hourlyRate || 0) * t.hours;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{t.date}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: 'linear-gradient(135deg, #06d6a0, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 600, color: 'white',
                      }}>
                        {user?.name.charAt(0)}
                      </div>
                      <span style={{ color: '#f8fafc', fontSize: '0.875rem' }}>{user?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{getProject(t.projectId)?.projectName}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>{periodLabels[t.period]}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#06d6a0', fontWeight: 600 }}>{t.hours}h</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{t.location || '-'}</td>
                  {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontSize: '0.875rem' }}>¥{user?.hourlyRate || 0}</td>}
                  {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171', fontSize: '0.875rem' }}>¥{laborCost.toLocaleString()}</td>}
                  <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>{t.projectType || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}><StatusBadge status={t.status} /></td>
                  {canApprove && (
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {t.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button onClick={() => updateTimesheetStatus(t.id, 'approved')} style={{
                            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          }}>批准</button>
                          <button onClick={() => updateTimesheetStatus(t.id, 'rejected')} style={{
                            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          }}>拒绝</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
