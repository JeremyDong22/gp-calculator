// v3.2 - 快速登录模块（测试模式）
// 更新：三字名一行显示、隐藏角色标签、隐藏费率和性别、秘书放最后
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface QuickLoginProps {
  onSwitchToLogin: () => void;
}

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

export function QuickLogin({ onSwitchToLogin }: QuickLoginProps) {
  const { login, users } = useAuth();

  // 按角色分组，秘书放最后，每组按级别排序
  const sortByLevel = (a: typeof users[0], b: typeof users[0]) => b.level - a.level;
  const groupedUsers = {
    department_head: users.filter(u => u.role === 'department_head').sort(sortByLevel),
    project_manager: users.filter(u => u.role === 'project_manager').sort(sortByLevel),
    employee: users.filter(u => u.role === 'employee').sort(sortByLevel),
    intern: users.filter(u => u.role === 'intern').sort(sortByLevel),
    secretary: users.filter(u => u.role === 'secretary').sort(sortByLevel),
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
      </div>

      <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        测试模式 · 选择角色快速登录
      </p>

      {/* User cards by role */}
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {(Object.entries(groupedUsers) as [Role, typeof users][]).map(([role, roleUsers]) => {
          if (roleUsers.length === 0) return null;
          const roleInfo = roleLabels[role];
          return (
            <div key={role} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}>
                {roleUsers.map((user, index) => {
                  // 三字名一行显示
                  const isThreeChar = user.name.length === 3;
                  return (
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
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        margin: 0,
                        letterSpacing: isThreeChar ? '0.5em' : 'normal',
                        textAlign: isThreeChar ? 'center' : 'left',
                      }}>
                        {user.name}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2rem' }}>
        测试模式 · 点击任意角色即可体验系统功能
      </p>
      <button
        onClick={onSwitchToLogin}
        style={{
          marginTop: '1rem', padding: '0.5rem 1rem',
          background: 'none', border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '8px', color: '#94a3b8', fontSize: '0.875rem',
          cursor: 'pointer',
        }}
      >
        切换正式登录
      </button>
    </div>
  );
}
