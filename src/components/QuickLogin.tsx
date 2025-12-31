// v2.0 - Premium login screen with animated cards
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';

export function QuickLogin() {
  const { login } = useAuth();

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
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        animation: 'fadeInUp 0.6s ease forwards',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 1.5rem',
          boxShadow: '0 20px 40px rgba(6, 214, 160, 0.3)',
        }}>
          💰
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          margin: 0,
          background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}>
          GP Calculator
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          marginTop: '0.5rem',
        }}>
          项目毛利计算系统
        </p>
      </div>

      {/* Login prompt */}
      <p style={{
        fontSize: '0.9375rem',
        color: '#94a3b8',
        marginBottom: '1.5rem',
        animation: 'fadeInUp 0.6s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        选择角色快速登录
      </p>

      {/* User cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        maxWidth: '900px',
        width: '100%',
      }}>
        {users.map((user, index) => {
          const isLeader = user.role === 'leader';
          return (
            <button
              key={user.id}
              onClick={() => login(user.id)}
              style={{
                background: 'rgba(26, 34, 52, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                animation: 'fadeInUp 0.5s ease forwards',
                animationDelay: `${0.2 + index * 0.1}s`,
                opacity: 0,
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = isLeader
                  ? 'rgba(124, 58, 237, 0.4)'
                  : 'rgba(6, 214, 160, 0.4)';
                e.currentTarget.style.boxShadow = isLeader
                  ? '0 20px 40px rgba(124, 58, 237, 0.2)'
                  : '0 20px 40px rgba(6, 214, 160, 0.2)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: isLeader
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : 'linear-gradient(135deg, #06d6a0, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '1rem',
              }}>
                {user.name.charAt(0)}
              </div>

              {/* Name */}
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#f8fafc',
                margin: '0 0 0.25rem 0',
              }}>
                {user.name}
              </h3>

              {/* Role badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                background: isLeader
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'rgba(6, 214, 160, 0.15)',
                color: isLeader ? '#a78bfa' : '#34d399',
                fontSize: '0.75rem',
                fontWeight: 500,
                marginBottom: '0.75rem',
              }}>
                {isLeader ? '👑 项目负责人' : '👤 员工'}
              </div>

              {/* Rate */}
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
              }}>
                费率: <span style={{ color: '#f8fafc', fontWeight: 600 }}>¥{user.hourlyRate}</span>/小时
              </p>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p style={{
        fontSize: '0.8125rem',
        color: '#475569',
        marginTop: '3rem',
        animation: 'fadeInUp 0.6s ease forwards',
        animationDelay: '0.6s',
        opacity: 0,
      }}>
        Demo模式 · 点击任意角色即可体验系统功能
      </p>
    </div>
  );
}
