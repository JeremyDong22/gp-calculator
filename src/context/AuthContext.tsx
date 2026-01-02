// v2.0 - 咨询部项目管理系统认证上下文
// 更新：支持5种角色的权限判断
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '../types';
import { users } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isDepartmentHead: boolean;
  isProjectManager: boolean;
  isSecretary: boolean;
  canCreateProject: boolean;
  canViewAllData: boolean;
  canEditRate: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const role = currentUser?.role as Role | undefined;
  const isDepartmentHead = role === 'department_head';
  const isProjectManager = role === 'project_manager';
  const isSecretary = role === 'secretary';
  const canCreateProject = isDepartmentHead || isProjectManager;
  const canViewAllData = isDepartmentHead;
  const canEditRate = isDepartmentHead;

  return (
    <AuthContext.Provider value={{
      currentUser, login, logout,
      isDepartmentHead, isProjectManager, isSecretary,
      canCreateProject, canViewAllData, canEditRate
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
