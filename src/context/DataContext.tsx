// v3.2 - 咨询部项目管理系统数据上下文
// 更新：新增项目控制表 projectControls 状态和CRUD操作
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TimesheetEntry, ExpenseEntry, Project, User, StaffAssignment, CashReceipt, ExecutorColorConfig, ProjectControlEntry } from '../types';
import { initialTimesheets, initialExpenses, projects as initialProjects, users as initialUsers, initialAssignments, initialCashReceipts, initialExecutorColors, initialProjectControls } from '../data/mockData';

interface DataContextType {
  // 数据状态
  timesheets: TimesheetEntry[];
  expenses: ExpenseEntry[];
  projects: Project[];
  users: User[];
  assignments: StaffAssignment[];
  cashReceipts: CashReceipt[];
  executorColors: ExecutorColorConfig[];
  projectControls: ProjectControlEntry[];

  // 工时操作
  addTimesheet: (entry: Omit<TimesheetEntry, 'id' | 'status'>) => void;
  updateTimesheet: (id: string, updates: Partial<TimesheetEntry>) => void;
  deleteTimesheet: (id: string) => void;
  approveTimesheet: (id: string, approverId: string, approverName: string, comment?: string) => void;
  rejectTimesheet: (id: string, approverId: string, approverName: string, comment?: string) => void;

  // 差旅报销操作
  addExpense: (entry: Omit<ExpenseEntry, 'id' | 'status'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseEntry>) => void;
  deleteExpense: (id: string) => void;
  confirmExpense: (id: string) => void;
  approveExpenseByExecutor: (id: string, approverId: string, comment: string) => void;
  approveExpenseByHead: (id: string, approverId: string, comment: string) => void;
  rejectExpense: (id: string, approverId: string, comment: string) => void;

  // 项目操作
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'confirmedReceipt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // 人员操作
  addUser: (user: Omit<User, 'id' | 'sortOrder' | 'password' | 'isFirstLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  reorderUsers: (userIds: string[]) => void;

  // 人员安排操作
  addAssignment: (assignment: Omit<StaffAssignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<StaffAssignment>) => void;
  deleteAssignment: (id: string) => void;

  // 现金收款操作
  addCashReceipt: (receipt: Omit<CashReceipt, 'id' | 'adjustedReceipt'>) => void;
  updateCashReceipt: (id: string, updates: Partial<CashReceipt>) => void;
  deleteCashReceipt: (id: string) => void;

  // 执行负责人颜色配置操作
  addExecutorColor: (config: Omit<ExecutorColorConfig, 'id'>) => void;
  updateExecutorColor: (id: string, updates: Partial<ExecutorColorConfig>) => void;
  deleteExecutorColor: (id: string) => void;

  // 项目控制表操作
  addProjectControl: (entry: Omit<ProjectControlEntry, 'id'>) => void;
  updateProjectControl: (id: string, updates: Partial<ProjectControlEntry>) => void;
  deleteProjectControl: (id: string) => void;
  getOrCreateProjectControl: (projectId: string, executorId: string) => ProjectControlEntry;

  // 兼容旧API
  updateTimesheetStatus: (id: string, status: TimesheetEntry['status']) => void;
  updateExpenseStatus: (id: string, status: ExpenseEntry['status']) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(initialTimesheets);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [assignments, setAssignments] = useState<StaffAssignment[]>(initialAssignments);
  const [cashReceipts, setCashReceipts] = useState<CashReceipt[]>(initialCashReceipts);
  const [executorColors, setExecutorColors] = useState<ExecutorColorConfig[]>(initialExecutorColors);
  const [projectControls, setProjectControls] = useState<ProjectControlEntry[]>(initialProjectControls);

  // 项目状态自动流转：0未开始→1进行中→2项目完成→3开完发票→4已收款
  const updateProjectStatusAuto = useCallback((projectId: string, trigger: 'timesheet' | 'completion' | 'invoice' | 'receipt') => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (trigger === 'timesheet' && p.status === 0) return { ...p, status: 1 as const };
      if (trigger === 'completion' && p.status === 1) return { ...p, status: 2 as const };
      if (trigger === 'invoice' && p.status === 2) return { ...p, status: 3 as const };
      if (trigger === 'receipt' && p.status === 3) return { ...p, status: 4 as const };
      return p;
    }));
  }, []);

  // 工时操作
  const addTimesheet = (entry: Omit<TimesheetEntry, 'id' | 'status'>) => {
    setTimesheets(prev => [...prev, { ...entry, id: `t${Date.now()}`, status: 'pending' }]);
    updateProjectStatusAuto(entry.projectId, 'timesheet');
  };

  const updateTimesheet = (id: string, updates: Partial<TimesheetEntry>) => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTimesheet = (id: string) => {
    setTimesheets(prev => prev.filter(t => t.id !== id));
  };

  const approveTimesheet = (id: string, approverId: string, approverName: string, comment?: string) => {
    setTimesheets(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'approved',
      approvalInfo: { approverId, approverName, approvalDate: new Date().toISOString().split('T')[0], comment }
    } : t));
  };

  const rejectTimesheet = (id: string, approverId: string, approverName: string, comment?: string) => {
    setTimesheets(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'rejected',
      approvalInfo: { approverId, approverName, approvalDate: new Date().toISOString().split('T')[0], comment }
    } : t));
  };

  // 差旅报销操作
  const addExpense = (entry: Omit<ExpenseEntry, 'id' | 'status'>) => {
    setExpenses(prev => [...prev, { ...entry, id: `e${Date.now()}`, status: 'pending' }]);
  };

  const updateExpense = (id: string, updates: Partial<ExpenseEntry>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const confirmExpense = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'user_confirmed',
      userConfirmation: { confirmed: true, date: new Date().toISOString().split('T')[0] }
    } : e));
  };

  const approveExpenseByExecutor = (id: string, approverId: string, comment: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'executor_approved',
      executorApproval: { approved: true, date: new Date().toISOString().split('T')[0], approverId, comment }
    } : e));
  };

  const approveExpenseByHead = (id: string, approverId: string, comment: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'approved',
      headApproval: { approved: true, date: new Date().toISOString().split('T')[0], approverId, comment }
    } : e));
  };

  const rejectExpense = (id: string, approverId: string, comment: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'rejected',
      headApproval: { approved: false, date: new Date().toISOString().split('T')[0], approverId, comment }
    } : e));
  };

  // 项目操作
  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'confirmedReceipt'>) => {
    setProjects(prev => [...prev, {
      ...project,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 0,
      confirmedReceipt: 0
    }]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };
      // 设置完成日期时自动流转到"项目完成"状态
      if (updates.completionDate && !p.completionDate && p.status === 1) {
        updated.status = 2;
      }
      return updated;
    }));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // 人员操作
  const addUser = (user: Omit<User, 'id' | 'sortOrder' | 'password' | 'isFirstLogin'>) => {
    const maxSortOrder = Math.max(...users.map(u => u.sortOrder), 0);
    setUsers(prev => [...prev, {
      ...user,
      id: `u${Date.now()}`,
      sortOrder: maxSortOrder + 1,
      password: '123456',
      isFirstLogin: true
    }]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const reorderUsers = (userIds: string[]) => {
    setUsers(prev => {
      const newUsers = [...prev];
      userIds.forEach((id, index) => {
        const user = newUsers.find(u => u.id === id);
        if (user) user.sortOrder = index + 1;
      });
      return newUsers.sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  // 人员安排操作
  const addAssignment = (assignment: Omit<StaffAssignment, 'id'>) => {
    setAssignments(prev => [...prev, { ...assignment, id: `a${Date.now()}` }]);
  };

  const updateAssignment = (id: string, updates: Partial<StaffAssignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // 现金收款操作
  const addCashReceipt = (receipt: Omit<CashReceipt, 'id' | 'adjustedReceipt'>) => {
    const adjustedReceipt = receipt.confirmedReceipt - receipt.developmentSplit - receipt.departmentSplit - receipt.otherSplit;
    setCashReceipts(prev => [...prev, { ...receipt, id: `cr${Date.now()}`, adjustedReceipt }]);
    // 开票日期触发状态流转到"开完发票"
    if (receipt.invoiceDate) {
      updateProjectStatusAuto(receipt.projectId, 'invoice');
    }
    // 有确认收款触发状态流转到"已收款"
    if (receipt.confirmedReceipt > 0) {
      updateProjectStatusAuto(receipt.projectId, 'receipt');
    }
  };

  const updateCashReceipt = (id: string, updates: Partial<CashReceipt>) => {
    setCashReceipts(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...updates };
      // 自动计算调整后收款
      updated.adjustedReceipt = updated.confirmedReceipt - updated.developmentSplit - updated.departmentSplit - updated.otherSplit;
      // 新增开票日期触发状态流转
      if (updates.invoiceDate && !r.invoiceDate) {
        updateProjectStatusAuto(r.projectId, 'invoice');
      }
      return updated;
    }));
  };

  const deleteCashReceipt = (id: string) => {
    setCashReceipts(prev => prev.filter(r => r.id !== id));
  };

  // 执行负责人颜色配置操作
  const addExecutorColor = (config: Omit<ExecutorColorConfig, 'id'>) => {
    setExecutorColors(prev => [...prev, { ...config, id: `ec${Date.now()}` }]);
  };

  const updateExecutorColor = (id: string, updates: Partial<ExecutorColorConfig>) => {
    setExecutorColors(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteExecutorColor = (id: string) => {
    setExecutorColors(prev => prev.filter(c => c.id !== id));
  };

  // 项目控制表操作
  const addProjectControl = (entry: Omit<ProjectControlEntry, 'id'>) => {
    setProjectControls(prev => [...prev, { ...entry, id: `pc${Date.now()}` }]);
  };

  const updateProjectControl = (id: string, updates: Partial<ProjectControlEntry>) => {
    setProjectControls(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteProjectControl = (id: string) => {
    setProjectControls(prev => prev.filter(c => c.id !== id));
  };

  // 获取或创建项目控制表条目
  const getOrCreateProjectControl = (projectId: string, executorId: string): ProjectControlEntry => {
    const existing = projectControls.find(c => c.projectId === projectId && c.executorId === executorId);
    if (existing) return existing;
    const newEntry: ProjectControlEntry = {
      id: `pc${Date.now()}`,
      projectId,
      executorId,
      clientContact: '',
      contractSent: false,
      contractReceived: false,
      draftSent: false,
      finalSent: false,
      reportSent: false,
      invoiced: false,
      badDebt: 0,
      teamMembers: '',
      remark: '',
      travelRemark: '',
    };
    setProjectControls(prev => [...prev, newEntry]);
    return newEntry;
  };

  // 兼容旧API
  const updateTimesheetStatus = (id: string, status: TimesheetEntry['status']) => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateExpenseStatus = (id: string, status: ExpenseEntry['status']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  return (
    <DataContext.Provider value={{
      timesheets, expenses, projects, users, assignments, cashReceipts, executorColors, projectControls,
      addTimesheet, updateTimesheet, deleteTimesheet, approveTimesheet, rejectTimesheet,
      addExpense, updateExpense, deleteExpense, confirmExpense, approveExpenseByExecutor, approveExpenseByHead, rejectExpense,
      addProject, updateProject, deleteProject,
      addUser, updateUser, deleteUser, reorderUsers,
      addAssignment, updateAssignment, deleteAssignment,
      addCashReceipt, updateCashReceipt, deleteCashReceipt,
      addExecutorColor, updateExecutorColor, deleteExecutorColor,
      addProjectControl, updateProjectControl, deleteProjectControl, getOrCreateProjectControl,
      updateTimesheetStatus, updateExpenseStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
