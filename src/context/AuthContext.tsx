// v3.0 - 咨询部项目管理系统认证上下文
// 更新：密码验证、首次登录强制修改密码、重置密码、测试模式切换
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import { users as initialUsers } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isTestMode: boolean;

  // 登录相关
  login: (userId: string) => void;
  loginWithPassword: (userId: string, password: string) => { success: boolean; error?: string; requirePasswordChange?: boolean };
  logout: () => void;

  // 密码管理
  changePassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  resetPassword: (userId: string) => { success: boolean; error?: string };
  validatePassword: (password: string) => { valid: boolean; error?: string };

  // 测试模式
  setTestMode: (enabled: boolean) => void;

  // 角色判断
  isDepartmentHead: boolean;
  isProjectManager: boolean;
  isSecretary: boolean;
  isEmployee: boolean;
  isIntern: boolean;

  // 权限判断
  canCreateProject: boolean;
  canViewAllData: boolean;
  canEditRate: boolean;
  canManageStaff: boolean;
  canApproveTimesheet: boolean;
  canApproveExpense: boolean;
  canViewCashReceipt: boolean;
  canViewGrossProfit: boolean;
  canViewTimesheetSummary: boolean;
  canInputExpense: boolean;

  // 项目相关权限
  isExecutionLeaderOf: (projectId: string, projects: { id: string; executionLeaderId: string }[]) => boolean;
  isDevelopmentLeaderOf: (projectId: string, projects: { id: string; developmentLeaderId: string }[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isTestMode, setIsTestMode] = useState(true); // 默认测试模式

  // 密码验证规则：必须包含数字和字母
  const validatePassword = useCallback((password: string): { valid: boolean; error?: string } => {
    if (password.length < 6) {
      return { valid: false, error: '密码长度至少6位' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: '密码必须包含数字' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, error: '密码必须包含字母' };
    }
    return { valid: true };
  }, []);

  // 测试模式登录（直接选人）
  const login = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, [users]);

  // 正式模式登录（需要密码）
  const loginWithPassword = useCallback((userId: string, password: string): { success: boolean; error?: string; requirePasswordChange?: boolean } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: '用户不存在' };
    }
    if (user.password !== password) {
      return { success: false, error: '密码错误' };
    }
    setCurrentUser(user);
    if (user.isFirstLogin) {
      return { success: true, requirePasswordChange: true };
    }
    return { success: true };
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  // 修改密码
  const changePassword = useCallback((userId: string, newPassword: string): { success: boolean; error?: string } => {
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, isFirstLogin: false } : u));
    // 更新当前用户状态
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword, isFirstLogin: false } : null);
    }
    return { success: true };
  }, [currentUser, validatePassword]);

  // 重置密码（仅部门负责人可用）
  const resetPassword = useCallback((userId: string): { success: boolean; error?: string } => {
    if (currentUser?.role !== 'department_head') {
      return { success: false, error: '只有部门负责人可以重置密码' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: '123456', isFirstLogin: true } : u));
    return { success: true };
  }, [currentUser]);

  // 测试模式切换
  const setTestMode = useCallback((enabled: boolean) => {
    setIsTestMode(enabled);
    if (!enabled) {
      // 切换到正式模式时登出
      setCurrentUser(null);
    }
  }, []);

  // 角色判断
  const role = currentUser?.role as Role | undefined;
  const isDepartmentHead = role === 'department_head';
  const isProjectManager = role === 'project_manager';
  const isSecretary = role === 'secretary';
  const isEmployee = role === 'employee';
  const isIntern = role === 'intern';

  // 权限判断
  const canCreateProject = isDepartmentHead || isProjectManager;
  const canViewAllData = isDepartmentHead;
  const canEditRate = isDepartmentHead;
  const canManageStaff = isDepartmentHead;
  const canApproveTimesheet = isDepartmentHead || isProjectManager;
  const canApproveExpense = isDepartmentHead || isProjectManager;
  const canViewCashReceipt = isDepartmentHead || isSecretary || isProjectManager; // 员工和实习生无权限
  const canViewGrossProfit = isDepartmentHead;
  const canViewTimesheetSummary = isDepartmentHead || isSecretary;
  const canInputExpense = isDepartmentHead || isSecretary;

  // 项目相关权限判断
  const isExecutionLeaderOf = useCallback((projectId: string, projects: { id: string; executionLeaderId: string }[]): boolean => {
    if (!currentUser) return false;
    const project = projects.find(p => p.id === projectId);
    return project?.executionLeaderId === currentUser.id;
  }, [currentUser]);

  const isDevelopmentLeaderOf = useCallback((projectId: string, projects: { id: string; developmentLeaderId: string }[]): boolean => {
    if (!currentUser) return false;
    const project = projects.find(p => p.id === projectId);
    return project?.developmentLeaderId === currentUser.id;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser, users, isTestMode,
      login, loginWithPassword, logout,
      changePassword, resetPassword, validatePassword,
      setTestMode,
      isDepartmentHead, isProjectManager, isSecretary, isEmployee, isIntern,
      canCreateProject, canViewAllData, canEditRate, canManageStaff,
      canApproveTimesheet, canApproveExpense, canViewCashReceipt,
      canViewGrossProfit, canViewTimesheetSummary, canInputExpense,
      isExecutionLeaderOf, isDevelopmentLeaderOf
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
