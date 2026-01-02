// v3.1 - 项目建项模块
// 更新：项目经理过滤（仅显示自己负责的项目）、负责人字段内联编辑
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../types';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#94a3b8',
  fontSize: '0.875rem',
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

const tdStyle: React.CSSProperties = {
  padding: '0.5rem',
  fontSize: '0.8125rem',
  borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
};

// 千分位格式化
const formatNumber = (num: number) => num.toLocaleString('zh-CN');

// 项目状态颜色
const statusColors: Record<ProjectStatus, string> = {
  0: '#64748b', // 未开始
  1: '#3b82f6', // 进行中
  2: '#06d6a0', // 项目完成
  3: '#fbbf24', // 开完发票
  4: '#a855f7', // 已收款
};

export function ProjectSetupPanel() {
  const { canCreateProject, isDepartmentHead, isProjectManager, currentUser } = useAuth();
  const { projects, users, addProject, updateProject, deleteProject } = useData();
  const [showForm, setShowForm] = useState(false);
  const [customDevLeader, setCustomDevLeader] = useState('');
  const [customExecLeader, setCustomExecLeader] = useState('');
  const [form, setForm] = useState({
    clientFullName: '',
    payer: '',
    projectShortName: '',
    contractAmount: 0,
    developmentLeaderId: '',
    developmentLeaderName: '',
    executionLeaderId: '',
    executionLeaderName: '',
  });

  // 项目经理只能看到自己负责的项目
  const filteredProjects = isProjectManager && !isDepartmentHead
    ? projects.filter(p => p.developmentLeaderId === currentUser?.id || p.executionLeaderId === currentUser?.id)
    : projects;

  // 可选为负责人的用户（项目负责人和部门负责人）
  const leaderCandidates = users.filter(u => u.role === 'project_manager' || u.role === 'department_head');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...form,
      developmentLeaderName: form.developmentLeaderId === 'custom' ? customDevLeader : undefined,
      executionLeaderName: form.executionLeaderId === 'custom' ? customExecLeader : undefined,
    };
    addProject(submitData);
    setForm({ clientFullName: '', payer: '', projectShortName: '', contractAmount: 0, developmentLeaderId: '', developmentLeaderName: '', executionLeaderId: '', executionLeaderName: '' });
    setCustomDevLeader('');
    setCustomExecLeader('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该项目吗？')) {
      deleteProject(id);
    }
  };

  if (!canCreateProject) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>您没有创建项目的权限</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>项目建项</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          {showForm ? '取消' : '+ 新建项目'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>委托方全称</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.clientFullName} onChange={e => setForm({ ...form, clientFullName: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>付款方</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.payer} onChange={e => setForm({ ...form, payer: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>项目简称</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.projectShortName} onChange={e => setForm({ ...form, projectShortName: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>合同金额</label>
              <input style={{ ...inputStyle, width: '100%' }} type="number" value={form.contractAmount} onChange={e => setForm({ ...form, contractAmount: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>开发负责人</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.developmentLeaderId} onChange={e => setForm({ ...form, developmentLeaderId: e.target.value })} required>
                <option value="">选择</option>
                {leaderCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                <option value="custom">自定义...</option>
              </select>
              {form.developmentLeaderId === 'custom' && (
                <input style={{ ...inputStyle, width: '100%', marginTop: '0.5rem' }} placeholder="输入名称" value={customDevLeader} onChange={e => setCustomDevLeader(e.target.value)} required />
              )}
            </div>
            <div>
              <label style={labelStyle}>执行负责人</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.executionLeaderId} onChange={e => setForm({ ...form, executionLeaderId: e.target.value })} required>
                <option value="">选择</option>
                {leaderCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                <option value="custom">自定义...</option>
              </select>
              {form.executionLeaderId === 'custom' && (
                <input style={{ ...inputStyle, width: '100%', marginTop: '0.5rem' }} placeholder="输入名称" value={customExecLeader} onChange={e => setCustomExecLeader(e.target.value)} required />
              )}
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            创建项目
          </button>
        </form>
      )}

      <div style={{ ...cardStyle, maxHeight: '70vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
          <thead>
            <tr>
              <th style={thStyle}>项目简称</th>
              <th style={thStyle}>委托方</th>
              <th style={thStyle}>付款方</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>合同金额</th>
              {isDepartmentHead && <th style={{ ...thStyle, textAlign: 'right' }}>确认收款</th>}
              <th style={thStyle}>开发负责人</th>
              <th style={thStyle}>执行负责人</th>
              <th style={thStyle}>状态</th>
              <th style={thStyle}>完成日期</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id}>
                <td style={{ ...tdStyle, color: '#f8fafc', fontWeight: 500 }}>{p.projectShortName}</td>
                <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.clientFullName}</td>
                <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.payer}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>¥{formatNumber(p.contractAmount)}</td>
                {isDepartmentHead && (
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24' }}>¥{formatNumber(p.confirmedReceipt)}</td>
                )}
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, width: '120px', color: '#94a3b8' }}
                    value={p.developmentLeaderId}
                    onChange={e => updateProject(p.id, { developmentLeaderId: e.target.value })}
                  >
                    <option value="">选择</option>
                    {leaderCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    <option value="custom">{p.developmentLeaderId === 'custom' ? p.developmentLeaderName : '自定义...'}</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, width: '120px', color: '#94a3b8' }}
                    value={p.executionLeaderId}
                    onChange={e => updateProject(p.id, { executionLeaderId: e.target.value })}
                  >
                    <option value="">选择</option>
                    {leaderCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    <option value="custom">{p.executionLeaderId === 'custom' ? p.executionLeaderName : '自定义...'}</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, width: '90px', color: statusColors[p.status] }}
                    value={p.status}
                    onChange={e => updateProject(p.id, { status: Number(e.target.value) as ProjectStatus })}
                  >
                    {([0, 1, 2, 3, 4] as ProjectStatus[]).map(s => (
                      <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <input
                    type="date"
                    style={{ ...inputStyle, width: '120px' }}
                    value={p.completionDate || ''}
                    onChange={e => updateProject(p.id, { completionDate: e.target.value })}
                  />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none',
                      background: 'rgba(239, 68, 68, 0.2)', color: '#f87171',
                      fontSize: '0.75rem', cursor: 'pointer',
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
