// v4.0 - 工时填报模块
// 更新：新增项目、手动输入日期、汇总工时表tab、导出excel、项目下拉菜单按建项时间排序、表头居中、修改功能修复
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { TimesheetEntry } from '../types';
import * as XLSX from 'xlsx';

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
  textAlign: 'center',
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
  const { timesheets, projects, users, addTimesheet, updateTimesheet, deleteTimesheet, updateTimesheetStatus, addProject } = useData();

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
  const [activeTab, setActiveTab] = useState<'entry' | 'summary'>('entry');
  const [form, setForm] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    totalHours: '',
    location: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    clientFullName: '',
    payer: '',
    projectShortName: '',
    contractAmount: '',
  });
  const [summaryStartDate, setSummaryStartDate] = useState('');
  const [summaryEndDate, setSummaryEndDate] = useState('');

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

  // 项目按建项时间排序（新到旧）
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects]);

  // 汇总工时数据
  const summaryData = useMemo(() => {
    const filtered = visibleTimesheets.filter(t => {
      if (t.status !== 'approved') return false;
      if (summaryStartDate && t.startDate < summaryStartDate) return false;
      if (summaryEndDate && t.endDate > summaryEndDate) return false;
      return true;
    });
    const grouped = new Map<string, { projectShortName: string; userName: string; totalHours: number }>();
    filtered.forEach(t => {
      const key = `${t.projectId}-${t.userId}`;
      const project = projects.find(p => p.id === t.projectId);
      const user = users.find(u => u.id === t.userId);
      if (!project || !user) return;
      const existing = grouped.get(key);
      if (existing) {
        existing.totalHours += t.totalHours;
      } else {
        grouped.set(key, { projectShortName: project.projectShortName, userName: user.name, totalHours: t.totalHours });
      }
    });
    return Array.from(grouped.values());
  }, [visibleTimesheets, projects, users, summaryStartDate, summaryEndDate]);

  const handleNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.projectShortName || !newProjectForm.clientFullName) return;
    addProject({
      clientFullName: newProjectForm.clientFullName,
      payer: newProjectForm.payer || newProjectForm.clientFullName,
      projectShortName: newProjectForm.projectShortName,
      contractAmount: Number(newProjectForm.contractAmount) || 0,
      developmentLeaderId: currentUser?.id || '',
      executionLeaderId: currentUser?.id || '',
    });
    setNewProjectForm({ clientFullName: '', payer: '', projectShortName: '', contractAmount: '' });
    setShowNewProjectForm(false);
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此工时记录？')) {
      deleteTimesheet(id);
    }
  };

  const canModify = (t: TimesheetEntry) => {
    return t.userId === currentUser?.id || isDepartmentHead;
  };

  const exportSummaryToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(summaryData.map(d => ({
      '项目简称': d.projectShortName,
      '姓名': d.userName,
      '累计工时': d.totalHours
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '汇总工时表');
    XLSX.writeFile(wb, `汇总工时表_${summaryStartDate || '全部'}_${summaryEndDate || '全部'}.xlsx`);
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

      {/* Tab切换 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('entry')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: activeTab === 'entry' ? 'linear-gradient(135deg, #06d6a0, #118ab2)' : 'rgba(148, 163, 184, 0.1)',
          color: activeTab === 'entry' ? 'white' : '#94a3b8', fontWeight: 500, cursor: 'pointer',
        }}>工时填报</button>
        <button onClick={() => setActiveTab('summary')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: activeTab === 'summary' ? 'linear-gradient(135deg, #06d6a0, #118ab2)' : 'rgba(148, 163, 184, 0.1)',
          color: activeTab === 'summary' ? 'white' : '#94a3b8', fontWeight: 500, cursor: 'pointer',
        }}>汇总工时表</button>
      </div>

      {activeTab === 'entry' && (
        <>
          {/* 填报表单 */}
          {!isDepartmentHead && !isProjectManager && (
            <>
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
                      {sortedProjects.map(p => <option key={p.id} value={p.id}>{p.projectShortName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>开始日期</label>
                    <input type="text" style={inputStyle} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} placeholder="YYYY-MM-DD" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>结束日期</label>
                    <input type="text" style={inputStyle} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} placeholder="YYYY-MM-DD" required />
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
                  <button type="button" onClick={() => setShowNewProjectForm(!showNewProjectForm)} style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    cursor: 'pointer',
                  }}>
                    {showNewProjectForm ? '取消新增项目' : '新增项目'}
                  </button>
                </div>
              </form>

              {showNewProjectForm && (
                <form onSubmit={handleNewProject} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>新增项目</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>项目简称*</label>
                      <input type="text" style={inputStyle} value={newProjectForm.projectShortName} onChange={e => setNewProjectForm({ ...newProjectForm, projectShortName: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>委托方全称*</label>
                      <input type="text" style={inputStyle} value={newProjectForm.clientFullName} onChange={e => setNewProjectForm({ ...newProjectForm, clientFullName: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>付款方</label>
                      <input type="text" style={inputStyle} value={newProjectForm.payer} onChange={e => setNewProjectForm({ ...newProjectForm, payer: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>合同金额</label>
                      <input type="number" style={inputStyle} value={newProjectForm.contractAmount} onChange={e => setNewProjectForm({ ...newProjectForm, contractAmount: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '0.75rem',
                  }}>
                    创建项目
                  </button>
                </form>
              )}
            </>
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
                  <th style={thStyle}>累计工时</th>
                  <th style={thStyle}>地点</th>
                  {isDepartmentHead && <th style={thStyle}>员工费率</th>}
                  {isDepartmentHead && <th style={thStyle}>人工成本</th>}
                  {(isDepartmentHead || isProjectManager) && <th style={thStyle}>操作</th>}
                  <th style={thStyle}>状态</th>
                </tr>
              </thead>
              <tbody>
                {visibleTimesheets.map(t => {
                  const user = getUser(t.userId);
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
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#06d6a0', fontWeight: 600, fontSize: '0.875rem' }}>{t.totalHours}h</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>{t.location || '-'}</td>
                      {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.875rem' }}>¥{(user?.dailyRate || 0).toLocaleString()}</td>}
                      {isDepartmentHead && <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f87171', fontSize: '0.875rem' }}>¥{laborCost.toLocaleString()}</td>}
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
        </>
      )}

      {activeTab === 'summary' && (
        <div>
          {/* 筛选条件 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>开始日期</label>
                <input type="text" style={{ ...inputStyle, width: '150px' }} value={summaryStartDate} onChange={e => setSummaryStartDate(e.target.value)} placeholder="YYYY-MM-DD" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>结束日期</label>
                <input type="text" style={{ ...inputStyle, width: '150px' }} value={summaryEndDate} onChange={e => setSummaryEndDate(e.target.value)} placeholder="YYYY-MM-DD" />
              </div>
              <button onClick={exportSummaryToExcel} style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                导出Excel
              </button>
            </div>
          </div>

          {/* 汇总表格 */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            overflow: 'auto',
            maxHeight: '70vh',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>项目简称</th>
                  <th style={thStyle}>姓名</th>
                  <th style={thStyle}>累计工时</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f8fafc', fontSize: '0.875rem' }}>{d.projectShortName}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f8fafc', fontSize: '0.875rem' }}>{d.userName}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#06d6a0', fontWeight: 600, fontSize: '0.875rem' }}>{d.totalHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
