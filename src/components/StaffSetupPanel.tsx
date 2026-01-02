// v3.2 - 人员建项模块
// 更新：删除性别列，"级别(年限)"改为"认定年限"(0-20年)，"重置"改为"重置密码"，表头居中对齐
import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Role, Gender, Level, User } from '../types';

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
  textAlign: 'center',
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

const roleLabels: Record<Role, string> = {
  employee: '员工',
  intern: '实习生',
  project_manager: '项目负责人',
  secretary: '部门秘书',
  department_head: '部门负责人',
};

// 生成认定年限选项 0-20
const levelOptions: Level[] = Array.from({ length: 21 }, (_, i) => i as Level);

// 可排序行组件
function SortableRow({ user, onUpdate, onDelete, onResetPassword }: {
  user: User;
  onUpdate: (id: string, updates: Partial<User>) => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: user.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'rgba(6, 214, 160, 0.1)' : 'transparent',
  };

  const cellInputStyle: React.CSSProperties = {
    ...inputStyle,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {/* 拖拽手柄 */}
      <td style={{ ...tdStyle, cursor: 'grab', width: '40px' }} {...attributes} {...listeners}>
        <span style={{ color: '#64748b' }}>⋮⋮</span>
      </td>
      {/* 序号 */}
      <td style={{ ...tdStyle, color: '#64748b', width: '40px' }}>{user.sortOrder}</td>
      {/* 姓名 */}
      <td style={tdStyle}>
        <input
          style={{ ...cellInputStyle, width: '80px' }}
          value={user.name}
          onChange={e => onUpdate(user.id, { name: e.target.value })}
        />
      </td>
      {/* 角色 */}
      <td style={tdStyle}>
        <select
          style={{ ...cellInputStyle, width: '100px' }}
          value={user.role}
          onChange={e => onUpdate(user.id, { role: e.target.value as Role })}
        >
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </td>
      {/* 认定年限 */}
      <td style={tdStyle}>
        <select
          style={{ ...cellInputStyle, width: '70px' }}
          value={user.level}
          onChange={e => onUpdate(user.id, { level: Number(e.target.value) as Level })}
        >
          {levelOptions.map(l => <option key={l} value={l}>{l}年</option>)}
        </select>
      </td>
      {/* 年薪包 */}
      <td style={tdStyle}>
        <input
          type="number"
          style={{ ...cellInputStyle, width: '100px', textAlign: 'right' }}
          value={user.annualSalary}
          onChange={e => onUpdate(user.id, { annualSalary: Number(e.target.value) })}
        />
      </td>
      {/* 员工工资(天) */}
      <td style={tdStyle}>
        <input
          type="number"
          style={{ ...cellInputStyle, width: '80px', textAlign: 'right' }}
          value={user.dailyWage}
          onChange={e => onUpdate(user.id, { dailyWage: Number(e.target.value) })}
        />
      </td>
      {/* 员工费率(天) */}
      <td style={tdStyle}>
        <input
          type="number"
          style={{ ...cellInputStyle, width: '80px', textAlign: 'right' }}
          value={user.dailyRate}
          onChange={e => onUpdate(user.id, { dailyRate: Number(e.target.value) })}
        />
      </td>
      {/* 备注 */}
      <td style={tdStyle}>
        <input
          style={{ ...cellInputStyle, width: '100px' }}
          value={user.remark || ''}
          onChange={e => onUpdate(user.id, { remark: e.target.value })}
        />
      </td>
      {/* 操作 */}
      <td style={{ ...tdStyle, width: '120px' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => onResetPassword(user.id)}
            style={{
              padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none',
              background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24',
              fontSize: '0.75rem', cursor: 'pointer',
            }}
            title="重置密码为123456"
          >
            重置密码
          </button>
          <button
            onClick={() => onDelete(user.id)}
            style={{
              padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none',
              background: 'rgba(239, 68, 68, 0.2)', color: '#f87171',
              fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

export function StaffSetupPanel() {
  const { isDepartmentHead, resetPassword } = useAuth();
  const { users, addUser, updateUser, deleteUser, reorderUsers } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: 'male' as Gender,
    role: 'employee' as Role,
    level: 0 as Level,
    annualSalary: 200000,
    dailyWage: 800,
    dailyRate: 4000,
    remark: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 按sortOrder排序
  const sortedUsers = [...users].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedUsers.findIndex(u => u.id === active.id);
      const newIndex = sortedUsers.findIndex(u => u.id === over.id);
      const newOrder = arrayMove(sortedUsers, oldIndex, newIndex);
      reorderUsers(newOrder.map(u => u.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(form);
    setForm({ name: '', gender: 'male', role: 'employee', level: 0, annualSalary: 200000, dailyWage: 800, dailyRate: 4000, remark: '' });
    setShowForm(false);
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('确定要重置该用户密码为123456吗？')) {
      resetPassword(userId);
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('确定要删除该用户吗？')) {
      deleteUser(userId);
    }
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>姓名</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>角色</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>认定年限</label>
              <select style={{ ...inputStyle, width: '100%' }} value={form.level} onChange={e => setForm({ ...form, level: Number(e.target.value) as Level })}>
                {levelOptions.map(l => <option key={l} value={l}>{l}年</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>年薪包</label>
              <input style={{ ...inputStyle, width: '100%' }} type="number" value={form.annualSalary} onChange={e => setForm({ ...form, annualSalary: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>员工工资(天)</label>
              <input style={{ ...inputStyle, width: '100%' }} type="number" value={form.dailyWage} onChange={e => setForm({ ...form, dailyWage: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>员工费率(天)</label>
              <input style={{ ...inputStyle, width: '100%' }} type="number" value={form.dailyRate} onChange={e => setForm({ ...form, dailyRate: Number(e.target.value) })} required />
            </div>
            <div>
              <label style={labelStyle}>备注</label>
              <input style={{ ...inputStyle, width: '100%' }} value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
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

      <div style={{ ...cardStyle, maxHeight: '70vh', overflow: 'auto' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '40px' }}></th>
                <th style={{ ...thStyle, width: '40px' }}>序号</th>
                <th style={thStyle}>姓名</th>
                <th style={thStyle}>角色</th>
                <th style={thStyle}>认定年限</th>
                <th style={thStyle}>年薪包</th>
                <th style={thStyle}>工资(天)</th>
                <th style={thStyle}>费率(天)</th>
                <th style={thStyle}>备注</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <SortableContext items={sortedUsers.map(u => u.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {sortedUsers.map(user => (
                  <SortableRow
                    key={user.id}
                    user={user}
                    onUpdate={updateUser}
                    onDelete={handleDelete}
                    onResetPassword={handleResetPassword}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
