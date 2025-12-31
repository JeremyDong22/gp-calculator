// v1.1 - Mock data for GP Calculator demo
import type { User, Project, TimesheetEntry, ExpenseEntry } from '../types';

export const users: User[] = [
  { id: 'u1', name: '张三', role: 'employee', hourlyRate: 500 },
  { id: 'u2', name: '李四', role: 'employee', hourlyRate: 600 },
  { id: 'u3', name: '王五', role: 'employee', hourlyRate: 800 },
  { id: 'leader1', name: '陈总监', role: 'leader', hourlyRate: 2000 },
];

export const projects: Project[] = [
  { id: 'p1', name: '宁德时代数字化项目', clientName: '宁德时代', leaderId: 'leader1', revenue: 500000 },
  { id: 'p2', name: '华为云迁移项目', clientName: '华为', leaderId: 'leader1', revenue: 800000 },
  { id: 'p3', name: '比亚迪ERP升级', clientName: '比亚迪', leaderId: 'leader1', revenue: 350000 },
];

export const initialTimesheets: TimesheetEntry[] = [
  { id: 't1', userId: 'u1', projectId: 'p1', date: '2024-12-30', hours: 8, description: '需求分析', status: 'pending' },
  { id: 't2', userId: 'u1', projectId: 'p2', date: '2024-12-31', hours: 4, description: '方案设计', status: 'approved' },
  { id: 't3', userId: 'u2', projectId: 'p1', date: '2024-12-30', hours: 6, description: '系统开发', status: 'approved' },
  { id: 't4', userId: 'u3', projectId: 'p3', date: '2024-12-31', hours: 8, description: '测试验收', status: 'pending' },
];

export const initialExpenses: ExpenseEntry[] = [
  { id: 'e1', userId: 'u1', projectId: 'p1', date: '2024-12-30', category: '高铁', amount: 553, description: '北京-深圳', receiptUrl: '/receipt1.jpg', status: 'pending' },
  { id: 'e2', userId: 'u2', projectId: 'p2', date: '2024-12-29', category: '住宿', amount: 480, description: '华为园区酒店', receiptUrl: '/receipt2.jpg', status: 'approved' },
  { id: 'e3', userId: 'u1', projectId: 'p1', date: '2024-12-30', category: '餐饮', amount: 120, description: '工作餐', receiptUrl: '/receipt3.jpg', status: 'approved' },
];
