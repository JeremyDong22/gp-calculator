// v3.1 - 执行负责人颜色配置模块
// 用于配置执行负责人在人员安排表中的显示颜色
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
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f8fafc',
  fontSize: '0.875rem',
};

const defaultColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6',
];

export function ExecutorColorConfigPanel() {
  const { isDepartmentHead } = useAuth();
  const { executorColors, users, addExecutorColor, updateExecutorColor, deleteExecutorColor } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ executorId: '', color: '#3b82f6' });

  // 获取可作为执行负责人的用户（项目负责人及以上）
  const executors = users.filter(u =>
    u.role === 'project_manager' || u.role === 'department_head' || u.role === 'secretary'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const executor = users.find(u => u.id === form.executorId);
    if (!executor) return;
    addExecutorColor({
      executorId: form.executorId,
      executorName: executor.name,
      color: form.color,
    });
    setForm({ executorId: '', color: '#3b82f6' });
    setShowForm(false);
  };

  if (!isDepartmentHead) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅部门负责人有权限配置颜色</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>🎨 执行负责人颜色配置</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>配置人员安排表中执行负责人的显示颜色</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          {showForm ? '取消' : '+ 添加配置'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>执行负责人</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.executorId} onChange={e => setForm({ ...form, executorId: e.target.value })} required>
                <option value="">选择负责人</option>
                {executors.filter(e => !executorColors.some(c => c.executorId === e.id)).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>颜色</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {defaultColors.map(c => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                      width: '24px', height: '24px', borderRadius: '4px', background: c, cursor: 'pointer',
                      border: form.color === c ? '2px solid white' : '2px solid transparent'
                    }} />
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" style={{
              padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
            }}>
              添加
            </button>
          </div>
        </form>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {executorColors.map(config => (
            <div key={config.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
              background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px',
              border: `2px solid ${config.color}40`
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', background: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 600, color: 'white'
              }}>
                {config.executorName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f8fafc', fontWeight: 500 }}>{config.executorName}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{config.color}</div>
              </div>
              <input type="color" value={config.color}
                onChange={e => updateExecutorColor(config.id, { color: e.target.value })}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
              <button onClick={() => deleteExecutorColor(config.id)} style={{
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
              }}>
                删除
              </button>
            </div>
          ))}
          {executorColors.length === 0 && (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              暂无颜色配置，点击"添加配置"开始
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
