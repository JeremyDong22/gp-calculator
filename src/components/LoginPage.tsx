// v3.0 - 密码登录页面
// 功能：密码登录、首次登录强制修改密码、忘记密码提示
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface LoginPageProps {
  onSwitchToTestMode: () => void;
}

export function LoginPage({ onSwitchToTestMode }: LoginPageProps) {
  const { users, loginWithPassword, changePassword } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // 按角色分组，秘书放最后
  const sortedUsers = [...users].sort((a, b) => {
    const roleOrder = { department_head: 0, project_manager: 1, employee: 2, intern: 3, secretary: 4 };
    return (roleOrder[a.role] || 5) - (roleOrder[b.role] || 5);
  });

  // 三字名一行显示
  const getUserDisplayStyle = (name: string) => {
    return name.length === 3 ? { display: 'inline-block', width: '100%' } : {};
  };

  const handleLogin = () => {
    if (!selectedUser) {
      setError('请选择用户');
      return;
    }
    const result = loginWithPassword(selectedUser.id, password);
    if (!result.success) {
      setError(result.error || '登录失败');
      return;
    }
    if (result.requirePasswordChange) {
      setShowPasswordChange(true);
      setError('');
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!selectedUser) return;
    const result = changePassword(selectedUser.id, newPassword);
    if (!result.success) {
      setError(result.error || '密码修改失败');
      return;
    }
    setShowPasswordChange(false);
    setError('');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      department_head: '部门负责人',
      project_manager: '项目负责人',
      employee: '员工',
      intern: '实习生',
      secretary: '秘书'
    };
    return labels[role] || role;
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

      {/* 登录表单 */}
      <div style={{
        background: 'rgba(26, 34, 52, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
      }}>
        {showPasswordChange ? (
          // 修改密码表单
          <>
            <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
              首次登录，请修改密码
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              密码必须包含数字和字母，至少6位
            </p>
            <input
              type="password"
              placeholder="新密码"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', marginBottom: '1rem',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px', color: '#f8fafc', fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="确认新密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', marginBottom: '1rem',
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px', color: '#f8fafc', fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <button
              onClick={handleChangePassword}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'linear-gradient(135deg, #06d6a0, #10b981)',
                border: 'none', borderRadius: '8px',
                color: 'white', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              确认修改
            </button>
          </>
        ) : showForgotPassword ? (
          // 忘记密码提示
          <>
            <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
              忘记密码？
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              请联系部门负责人重置密码
            </p>
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'rgba(148, 163, 184, 0.2)',
                border: 'none', borderRadius: '8px',
                color: '#f8fafc', fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              返回登录
            </button>
          </>
        ) : (
          // 登录表单
          <>
            <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              用户登录
            </h2>

            {/* 用户选择 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                选择用户
              </label>
              <select
                value={selectedUser?.id || ''}
                onChange={e => {
                  const user = users.find(u => u.id === e.target.value);
                  setSelectedUser(user || null);
                  setError('');
                }}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px', color: '#f8fafc', fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">请选择...</option>
                {sortedUsers.map(user => (
                  <option key={user.id} value={user.id} style={getUserDisplayStyle(user.name)}>
                    {user.name} ({getRoleLabel(user.role)})
                  </option>
                ))}
              </select>
            </div>

            {/* 密码输入 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                密码
              </label>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px', color: '#f8fafc', fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'linear-gradient(135deg, #06d6a0, #10b981)',
                border: 'none', borderRadius: '8px',
                color: 'white', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '1rem',
              }}
            >
              登录
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none', border: 'none',
                  color: '#64748b', fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                忘记密码？
              </button>
              <button
                onClick={onSwitchToTestMode}
                style={{
                  background: 'none', border: 'none',
                  color: '#06d6a0', fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                切换测试模式
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
