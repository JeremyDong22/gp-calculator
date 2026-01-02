// v2.0 - 咨询部项目管理系统数据上下文
// 更新：项目、人员、人员安排、现金收款等状态管理
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TimesheetEntry, ExpenseEntry, Project, User, StaffAssignment, CashReceipt } from '../types';
import { initialTimesheets, initialExpenses, projects as initialProjects, users as initialUsers, initialAssignments, initialCashReceipts } from '../data/mockData';

interface DataContextType {
  timesheets: TimesheetEntry[];
  expenses: ExpenseEntry[];
  projects: Project[];
  users: User[];
  assignments: StaffAssignment[];
  cashReceipts: CashReceipt[];
  addTimesheet: (entry: Omit<TimesheetEntry, 'id' | 'status'>) => void;
  addExpense: (entry: Omit<ExpenseEntry, 'id' | 'status'>) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addAssignment: (assignment: Omit<StaffAssignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<StaffAssignment>) => void;
  deleteAssignment: (id: string) => void;
  addCashReceipt: (receipt: Omit<CashReceipt, 'id'>) => void;
  updateCashReceipt: (id: string, updates: Partial<CashReceipt>) => void;
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

  const addTimesheet = (entry: Omit<TimesheetEntry, 'id' | 'status'>) => {
    setTimesheets(prev => [...prev, { ...entry, id: `t${Date.now()}`, status: 'pending' }]);
  };

  const addExpense = (entry: Omit<ExpenseEntry, 'id' | 'status'>) => {
    setExpenses(prev => [...prev, { ...entry, id: `e${Date.now()}`, status: 'pending' }]);
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    setProjects(prev => [...prev, { ...project, id: `p${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: `u${Date.now()}` }]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const addAssignment = (assignment: Omit<StaffAssignment, 'id'>) => {
    setAssignments(prev => [...prev, { ...assignment, id: `a${Date.now()}` }]);
  };

  const updateAssignment = (id: string, updates: Partial<StaffAssignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const addCashReceipt = (receipt: Omit<CashReceipt, 'id'>) => {
    setCashReceipts(prev => [...prev, { ...receipt, id: `cr${Date.now()}` }]);
  };

  const updateCashReceipt = (id: string, updates: Partial<CashReceipt>) => {
    setCashReceipts(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateTimesheetStatus = (id: string, status: TimesheetEntry['status']) => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateExpenseStatus = (id: string, status: ExpenseEntry['status']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  return (
    <DataContext.Provider value={{
      timesheets, expenses, projects, users, assignments, cashReceipts,
      addTimesheet, addExpense, addProject, updateProject, addUser, updateUser,
      addAssignment, updateAssignment, deleteAssignment, addCashReceipt, updateCashReceipt,
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
