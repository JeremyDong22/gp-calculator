// v2.1 - Premium Financial Dashboard with glass morphism design + responsive layout
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { QuickLogin } from './components/QuickLogin';
import { TimesheetPanel } from './components/TimesheetPanel';
import { ExpensePanel } from './components/ExpensePanel';
import { GrossProfitDashboard } from './components/GrossProfitDashboard';
import './index.css';

type Tab = 'timesheet' | 'expense' | 'gp';

function MainApp() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('timesheet');

  if (!currentUser) return <QuickLogin />;

  const isLeader = currentUser.role === 'leader';

  const tabs = [
    { id: 'timesheet' as Tab, label: '工时填报', icon: '⏱️' },
    { id: 'expense' as Tab, label: '差旅报销', icon: '✈️' },
    ...(isLeader ? [{ id: 'gp' as Tab, label: '毛利分析', icon: '📊' }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.125rem',
            flexShrink: 0,
          }}>
            💰
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              GP Calculator
            </h1>
            <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: 0 }}>项目毛利计算系统</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isLeader
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'linear-gradient(135deg, #06d6a0, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'white',
              flexShrink: 0,
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'none' }} className="user-info-text">
              <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0, color: '#f8fafc' }}>
                {currentUser.name}
              </p>
              <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: 0 }}>
                {isLeader ? '项目负责人' : '员工'} · ¥{currentUser.hourlyRate}/h
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#94a3b8',
              padding: '0.375rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            退出
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'rgba(17, 24, 39, 0.5)',
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '0.375rem',
        borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(17, 138, 178, 0.15))'
                : 'transparent',
              color: activeTab === tab.id ? '#06d6a0' : '#64748b',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              ...(activeTab === tab.id && {
                boxShadow: 'inset 0 0 0 1px rgba(6, 214, 160, 0.2)',
              }),
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'timesheet' && <TimesheetPanel />}
        {activeTab === 'expense' && <ExpensePanel />}
        {activeTab === 'gp' && isLeader && <GrossProfitDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
