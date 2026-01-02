// v3.6 - 咨询部-项目管理系统（工时、报销）
// 更新：添加版本号显示

const APP_VERSION = 'v3.6-20250102';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { QuickLogin } from './components/QuickLogin';
import { LoginPage } from './components/LoginPage';
import { ProjectSetupPanel } from './components/ProjectSetupPanel';
import { StaffSetupPanel } from './components/StaffSetupPanel';
import { StaffAssignmentPanel } from './components/StaffAssignmentPanel';
import { TimesheetPanel } from './components/TimesheetPanel';
import { ExpensePanel } from './components/ExpensePanel';
import { GrossProfitDashboard } from './components/GrossProfitDashboard';
import { CashReceiptPanel } from './components/CashReceiptPanel';
import { ExecutorColorConfigPanel } from './components/ExecutorColorConfigPanel';
import { TimesheetSummaryPanel } from './components/TimesheetSummaryPanel';
import { ProjectControlPanel } from './components/ProjectControlPanel';
import { BonusCalculationPanel } from './components/BonusCalculationPanel';
import './index.css';

type Tab = 'project' | 'staff' | 'assignment' | 'timesheet' | 'expense' | 'gp' | 'cash' | 'color' | 'summary' | 'control' | 'bonus';

const roleLabels: Record<string, string> = {
  employee: '员工',
  intern: '实习生',
  project_manager: '项目负责人',
  secretary: '部门秘书',
  department_head: '部门负责人',
};

function MainApp() {
  const { currentUser, logout, isTestMode, setTestMode, isDepartmentHead, isProjectManager, isSecretary } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('timesheet');

  // 未登录时显示登录页面
  if (!currentUser) {
    return isTestMode
      ? <QuickLogin onSwitchToLogin={() => setTestMode(false)} />
      : <LoginPage onSwitchToTestMode={() => setTestMode(true)} />;
  }

  const canManage = isDepartmentHead || isProjectManager;

  // 根据角色显示不同的Tab
  const tabs = [
    { id: 'project' as Tab, label: '项目建项', icon: '📁', show: canManage },
    { id: 'staff' as Tab, label: '人员建项', icon: '👥', show: isDepartmentHead },
    { id: 'assignment' as Tab, label: '人员安排', icon: '📅', show: true },
    { id: 'timesheet' as Tab, label: '工时填报', icon: '⏱️', show: true },
    { id: 'expense' as Tab, label: '差旅报销', icon: '✈️', show: true },
    { id: 'summary' as Tab, label: '工时汇总', icon: '📋', show: canManage },
    { id: 'control' as Tab, label: '项目控制表', icon: '📑', show: canManage },
    { id: 'gp' as Tab, label: '项目毛利分析', icon: '📊', show: isDepartmentHead },
    { id: 'bonus' as Tab, label: '奖金计算表', icon: '💰', show: isDepartmentHead },
    { id: 'cash' as Tab, label: '现金收款表', icon: '💵', show: isDepartmentHead },
    { id: 'color' as Tab, label: '颜色配置', icon: '🎨', show: isDepartmentHead },
  ].filter(t => t.show);

  const roleGradient = isDepartmentHead
    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
    : isProjectManager
    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
    : isSecretary
    ? 'linear-gradient(135deg, #ec4899, #f472b6)'
    : 'linear-gradient(135deg, #06d6a0, #10b981)';

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
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', flexShrink: 0,
          }}>
            💰
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              咨询部-项目管理系统
            </h1>
            <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: 0 }}>工时、报销 | {APP_VERSION}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* 测试模式开关 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: isTestMode ? '#fbbf24' : '#64748b' }}>
              {isTestMode ? '测试' : '正式'}
            </span>
            <button
              onClick={() => setTestMode(!isTestMode)}
              style={{
                width: '40px', height: '20px', borderRadius: '10px',
                background: isTestMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(148, 163, 184, 0.2)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: isTestMode ? '#fbbf24' : '#64748b',
                position: 'absolute', top: '2px',
                left: isTestMode ? '22px' : '2px',
                transition: 'all 0.2s',
              }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: roleGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8125rem', fontWeight: 600, color: 'white', flexShrink: 0,
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, margin: 0, color: '#f8fafc' }}>
                {currentUser.name}
              </p>
              <p style={{ fontSize: '0.625rem', color: '#64748b', margin: 0 }}>
                {roleLabels[currentUser.role]}
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
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(17, 138, 178, 0.15))'
                : 'transparent',
              color: activeTab === tab.id ? '#06d6a0' : '#64748b',
              fontSize: '0.8125rem',
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
        {activeTab === 'project' && <ProjectSetupPanel />}
        {activeTab === 'staff' && <StaffSetupPanel />}
        {activeTab === 'assignment' && <StaffAssignmentPanel />}
        {activeTab === 'timesheet' && <TimesheetPanel />}
        {activeTab === 'expense' && <ExpensePanel onNavigateToAssignment={() => setActiveTab('assignment')} />}
        {activeTab === 'summary' && <TimesheetSummaryPanel />}
        {activeTab === 'control' && <ProjectControlPanel />}
        {activeTab === 'gp' && <GrossProfitDashboard />}
        {activeTab === 'bonus' && <BonusCalculationPanel />}
        {activeTab === 'cash' && <CashReceiptPanel />}
        {activeTab === 'color' && <ExecutorColorConfigPanel />}
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
