// v3.0 - 快速登录模块
// 更新：支持5种角色（员工、实习生、项目负责人、部门秘书、部门负责人）
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';
import type { Role } from '../types';

const roleLabels: Record<Role, { label: string; icon: string; color: string; bg: string }> = {
  employee: { label: '员工', icon: '👤', color: '#34d399', bg: 'rgba(6, 214, 160, 0.15)' },
  intern: { label: '实习生', icon: '🎓', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
  project_manager: { label: '项目负责人', icon: '📋', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  secretary: { label: '部门秘书', icon: '📝', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' },
  department_head: { label: '部门负责人', icon: '👑', color: '#a78bfa', bg: 'rgba(124, 58, 237, 0.15)' },
};

const roleGradients: Record<Role, string> = {
  employee: 'linear-gradient(135deg, #06d6a0, #10b981)',
  intern: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  project_manager: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  secretary: 'linear-gradient(135deg, #ec4899, #f472b6)',
  department_head: 'linear-gradient(135deg, #7c3aed, #a855f7)',
};

export function QuickLogin() {
  const { login } = useAuth();

  // 按角色分组
  const groupedUsers = {
    department_head: users.filter(u => u.role === 'department_head'),
    project_manager: users.filter(u => u.role === 'project_manager'),
    secretary: users.filter(u => u.role === 'secretary'),
    employee: users.filter(u => u.role === 'employee'),
    intern: users.filter(u => u.role === 'intern'),
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeInUp 0.6s ease forwards' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', margin: '0 auto 1.5rem',
          boxShadow: '0 20px 40px rgba(6, 214, 160, 0.3)',
        }}>
          💰
        </div>
        <h1 style={{
          fontSize: '2rem', fontWeight: 800, margin: 0,
          background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          咨询部-项目管理系统
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>
          工时、报销、毛利分析
        </p>
      </div>

      <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        选择角色快速登录
      </p>

      {/* User cards by role */}
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {(Object.entries(groupedUsers) as [Role, typeof users][]).map(([role, roleUsers]) => {
          if (roleUsers.length === 0) return null;
          const roleInfo = roleLabels[role];
          return (
            <div key={role} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '0.75rem', padding: '0.5rem 0.75rem',
                background: roleInfo.bg, borderRadius: '8px', width: 'fit-content',
              }}>
                <span>{roleInfo.icon}</span>
                <span style={{ color: roleInfo.color, fontSize: '0.875rem', fontWeight: 600 }}>{roleInfo.label}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}>
                {roleUsers.map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => login(user.id)}
                    style={{
                      background: 'rgba(26, 34, 52, 0.7)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      animation: 'fadeInUp 0.5s ease forwards',
                      animationDelay: `${0.1 + index * 0.05}s`,
                      opacity: 0,
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = roleInfo.color;
                      e.currentTarget.style.boxShadow = `0 10px 30px ${roleInfo.bg}`;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: roleGradients[role],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem',
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                      {user.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                      {user.gender === 'male' ? '男' : '女'} · ¥{user.hourlyRate}/h
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2rem' }}>
        Demo模式 · 点击任意角色即可体验系统功能
      </p>
    </div>
  );
}
