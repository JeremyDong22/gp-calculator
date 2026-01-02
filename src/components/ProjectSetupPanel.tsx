// v1.0 - 项目建项模块
// 功能：创建和管理项目，包含委托方、合同金额、负责人等字段
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  color: '#94a3b8',
  fontSize: '0.875rem',
};

export function ProjectSetupPanel() {
  const { canCreateProject, isDepartmentHead } = useAuth();
  const { projects, users, addProject, updateProject } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientFullName: '',
    projectName: '',
    contractAmount: 0,
    receivedAmount: 0,
    developmentLeaderId: '',
    executionLeaderId: '',
    revenue: 0,
  });

  const projectManagers = users.filter(u => u.role === 'project_manager' || u.role === 'department_head');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject(form);
    setForm({ clientFullName: '', projectName: '', contractAmount: 0, receivedAmount: 0, developmentLeaderId: '', executionLeaderId: '', revenue: 0 });
    setShowForm(false);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || '-';

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>委托方全称</label>
              <input style={inputStyle} value={form.clientFullName} onChange={e => setForm({ ...form, clientFullName: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>项目名称</label>
              <input style={inputStyle} value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>合同金额</label>
              <input style={inputStyle} type="number" value={form.contractAmount} onChange={e => setForm({ ...form, contractAmount: Number(e.target.value) })} required />
            </div>
            {isDepartmentHead && (
              <div>
                <label style={labelStyle}>收款金额</label>
                <input style={inputStyle} type="number" value={form.receivedAmount} onChange={e => setForm({ ...form, receivedAmount: Number(e.target.value) })} />
              </div>
            )}
            <div>
              <label style={labelStyle}>收入</label>
              <input style={inputStyle} type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>开发负责人</label>
              <select style={inputStyle} value={form.developmentLeaderId} onChange={e => setForm({ ...form, developmentLeaderId: e.target.value })} required>
                <option value="">选择</option>
                {projectManagers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>执行负责人</label>
              <select style={inputStyle} value={form.executionLeaderId} onChange={e => setForm({ ...form, executionLeaderId: e.target.value })} required>
                <option value="">选择</option>
                {projectManagers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
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

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>项目名称</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>委托方</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>合同金额</th>
              {isDepartmentHead && <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>收款金额</th>}
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>收入</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>开发负责人</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>执行负责人</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{p.projectName}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{p.clientFullName}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#06d6a0', fontSize: '0.875rem' }}>¥{p.contractAmount.toLocaleString()}</td>
                {isDepartmentHead && (
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fbbf24', fontSize: '0.875rem' }}>
                    <input
                      type="number"
                      value={p.receivedAmount}
                      onChange={e => updateProject(p.id, { receivedAmount: Number(e.target.value) })}
                      style={{ ...inputStyle, width: '100px', textAlign: 'right' }}
                    />
                  </td>
                )}
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#818cf8', fontSize: '0.875rem' }}>¥{p.revenue.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{getUserName(p.developmentLeaderId)}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{getUserName(p.executionLeaderId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
