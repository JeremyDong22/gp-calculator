// v3.4 - 工时填报模块
// 更新：修复审批权限，执行负责人只能审批自己负责项目的工时
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

export function TimesheetPanel() {
  const { currentUser, isDepartmentHead, isProjectManager, isSecretary, isExecutionLeaderOf } = useAuth();
  const { timesheets, projects, users, addTimesheet, updateTimesheet, deleteTimesheet, updateTimesheetStatus } = useData();

  if (isSecretary) {
    return (
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '1.5rem',
      }}>
        <p style={{ color: '#94a3b8' }}>秘书无权限访问此页面</p>
      </div>
    );
  }
  const [form, setForm] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    totalHours: '',
    location: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canApprove = (t: TimesheetEntry) => {
    if (isDepartmentHead) return true;
    if (isProjectManager && isExecutionLeaderOf(t.projectId, projects)) return true;
    return false;
  };

  // 可见工时记录
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.projectId || !form.startDate || !form.endDate || !form.totalHours) return;

    if (editingId) {
      updateTimesheet(editingId, {
        projectId: form.projectId,
        startDate: form.startDate,
        endDate: form.endDate,
        totalHours: Number(form.totalHours),
        location: form.location,
      });
      setEditingId(null);
    } else {
      addTimesheet({
        userId: currentUser.id,
        projectId: form.projectId,
        startDate: form.startDate,
        endDate: form.endDate,
        totalHours: Number(form.totalHours),
        location: form.location,
      });
    }
    setForm({ projectId: '', startDate: '', endDate: '', totalHours: '', location: '' });
  };

  const handleEdit = (t: TimesheetEntry) => {
    setForm({
      projectId: t.projectId,
      startDate: t.startDate,
      endDate: t.endDate,
      totalHours: t.totalHours.toString(),
      location: t.location || '',
    });
    setEditingId(t.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此工时记录？')) {
      deleteTimesheet(id);
    }
  };

  const canModify = (t: TimesheetEntry) => {
    return t.userId === currentUser?.id || isDepartmentHead;
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

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
          {isDepartmentHead || isProjectManager ? '审核团队成员的工时记录' : '填报项目工时'}
        </p>
      </div>

      {/* 填报表单 */}
      {!isDepartmentHead && !isProjectManager && (
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
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>开始日期</label>
              <input type="date" style={inputStyle} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>结束日期</label>
              <input type="date" style={inputStyle} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>累计工时</label>
              <input type="number" style={inputStyle} value={form.totalHours} onChange={e => setForm({ ...form, totalHours: e.target.value })} min="0.5" step="0.5" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>工作地点</label>
              <input type="text" style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="北京" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="submit" style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              {editingId ? '更新工时' : '提交工时'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ projectId: '', startDate: '', endDate: '', totalHours: '', location: '' }); }} style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(148, 163, 184, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
              }}>
                取消
              </button>
            )}
          </div>
        </form>
      )}

      {/* 工时列表 */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        overflow: 'auto',
        maxHeight: '70vh',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isDepartmentHead ? '900px' : '700px' }}>
          <thead>
            <tr>
              <th style={thStyle}>姓名</th>
              <th style={thStyle}>项目简称</th>
              <th style={thStyle}>开始日期</th>
              <th style={thStyle}>结束日期</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>累计工时</th>
              <th style={thStyle}>地点</th>
              {isDepartmentHead && <th style={{ ...thStyle, textAlign: 'right' }}>员工费率</th>}
              {isDepartmentHead && <th style={{ ...thStyle, textAlign: 'right' }}>人工成本</th>}
              {(isDepartmentHead || isProjectManager) && <th style={{ ...thStyle, textAlign: 'center' }}>操作</th>}
              <th style={{ ...thStyle, textAlign: 'center' }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {visibleTimesheets.map(t => {
              const user = getUser(t.userId);
              // 人工成本 = 累计工时 × 员工费率 ÷ 8
              const laborCost = (t.totalHours * (user?.dailyRate || 0)) / 8;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
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
                  <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{getProject(t.projectId)?.projectShortName}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{t.startDate}</td>
                  <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{t.endDate}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#06d6a0', fontWeight: 600 }}>
                    {canModify(t) ? (
                      <input
                        type="number"
                        value={t.totalHours}
                        onChange={e => updateTimesheet(t.id, { totalHours: Number(e.target.value) })}
                        style={{ ...inputStyle, fontSize: '0.875rem', padding: '0.25rem', textAlign: 'right', width: '60px' }}
                        min="0.5"
                        step="0.5"
                      />
                    ) : (
                      <span>{t.totalHours}h</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {canModify(t) ? (
                      <input
                        type="text"
                        value={t.location || ''}
                        onChange={e => updateTimesheet(t.id, { location: e.target.value })}
                        style={{ ...inputStyle, fontSize: '0.875rem', padding: '0.25rem' }}
                        placeholder="地点"
                      />
                    ) : (
                      <span style={{ color: '#94a3b8' }}>{t.location || '-'}</span>
                    )}
                  </td>
                  {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontSize: '0.875rem' }}>¥{(user?.dailyRate || 0).toLocaleString()}</td>}
                  {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'right', color: '#f87171', fontSize: '0.875rem' }}>¥{laborCost.toLocaleString()}</td>}
                  {(isDepartmentHead || isProjectManager) && (
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {t.status === 'pending' && canApprove(t) && (
                          <>
                            <button onClick={() => updateTimesheetStatus(t.id, 'approved')} style={{
                              background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#34d399', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                            }}>批准</button>
                            <button onClick={() => updateTimesheetStatus(t.id, 'rejected')} style={{
                              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                            }}>拒绝</button>
                          </>
                        )}
                        {canModify(t) && (
                          <>
                            <button onClick={() => handleEdit(t)} style={{
                              background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                            }}>修改</button>
                            <button onClick={() => handleDelete(t.id)} style={{
                              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                            }}>删除</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}><StatusBadge status={t.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
