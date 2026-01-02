// v1.0 - 人员建项模块
// 功能：创建和管理人员，包含姓名、性别、费率、级别等字段，仅部门负责人有权限
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Role, Gender, Level } from '../types';

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

const roleLabels: Record<Role, string> = {
  employee: '员工',
  intern: '实习生',
  project_manager: '项目负责人',
  secretary: '部门秘书',
  department_head: '部门负责人',
};

const levelLabels: Record<Level, string> = {
  junior: '初级',
  mid: '中级',
  senior: '高级',
  expert: '专家',
};

export function StaffSetupPanel() {
  const { isDepartmentHead, canEditRate } = useAuth();
  const { users, addUser, updateUser } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: 'male' as Gender,
    role: 'employee' as Role,
    hourlyRate: 500,
    level: 'mid' as Level,
    remark: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(form);
    setForm({ name: '', gender: 'male', role: 'employee', hourlyRate: 500, level: 'mid', remark: '' });
    setShowForm(false);
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限管理人员</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>人员建项</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          {showForm ? '取消' : '+ 新增人员'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>姓名</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>性别</label>
              <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as Gender })}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>角色</label>
              <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>费率 (¥/h)</label>
              <input style={inputStyle} type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>级别</label>
              <select style={inputStyle} value={form.level} onChange={e => setForm({ ...form, level: e.target.value as Level })}>
                {Object.entries(levelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>备注</label>
              <input style={inputStyle} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>
            添加人员
          </button>
        </form>
      )}

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>姓名</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>性别</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>角色</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>费率</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>级别</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem' }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem', color: '#f8fafc', fontSize: '0.875rem' }}>{u.name}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{u.gender === 'male' ? '男' : '女'}</td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{roleLabels[u.role]}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>
                  {canEditRate ? (
                    <input
                      type="number"
                      value={u.hourlyRate}
                      onChange={e => updateUser(u.id, { hourlyRate: Number(e.target.value) })}
                      style={{ ...inputStyle, width: '80px', textAlign: 'right' }}
                    />
                  ) : (
                    <span style={{ color: '#06d6a0' }}>¥{u.hourlyRate}</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>{levelLabels[u.level]}</td>
                <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>{u.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
