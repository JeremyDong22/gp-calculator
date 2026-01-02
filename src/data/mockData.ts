// v2.0 - 咨询部项目管理系统Mock数据
// 更新：5种角色、扩展项目字段、人员安排、现金收款等
import type { User, Project, TimesheetEntry, ExpenseEntry, StaffAssignment, CashReceipt } from '../types';

export const users: User[] = [
  { id: 'u1', name: '张三', gender: 'male', role: 'employee', hourlyRate: 500, level: 'mid', remark: '' },
  { id: 'u2', name: '李四', gender: 'male', role: 'employee', hourlyRate: 600, level: 'senior', remark: '' },
  { id: 'u3', name: '王五', gender: 'male', role: 'employee', hourlyRate: 800, level: 'senior', remark: '' },
  { id: 'u4', name: '刘秋彤', gender: 'female', role: 'employee', hourlyRate: 450, level: 'mid', remark: '' },
  { id: 'u5', name: '彭颖超', gender: 'male', role: 'employee', hourlyRate: 550, level: 'mid', remark: '' },
  { id: 'intern1', name: '张怡雯', gender: 'female', role: 'intern', hourlyRate: 200, level: 'junior', remark: '郑大实习生' },
  { id: 'intern2', name: '欧珂珂', gender: 'female', role: 'intern', hourlyRate: 200, level: 'junior', remark: '郑州实习生' },
  { id: 'pm1', name: '傅曲博', gender: 'male', role: 'project_manager', hourlyRate: 1200, level: 'expert', remark: '' },
  { id: 'pm2', name: '李胜男', gender: 'female', role: 'project_manager', hourlyRate: 1100, level: 'expert', remark: '' },
  { id: 'pm3', name: '刘宽', gender: 'male', role: 'project_manager', hourlyRate: 1300, level: 'expert', remark: '' },
  { id: 'sec1', name: '宋彩媛', gender: 'female', role: 'secretary', hourlyRate: 600, level: 'mid', remark: '部门秘书' },
  { id: 'head1', name: '郭瑞刚', gender: 'male', role: 'department_head', hourlyRate: 2000, level: 'expert', remark: '部门负责人' },
];

export const projects: Project[] = [
  {
    id: 'p1',
    clientFullName: '宁德时代新能源科技股份有限公司',
    projectName: '宁德时代数字化项目',
    contractAmount: 500000,
    receivedAmount: 400000,
    developmentLeaderId: 'pm1',
    executionLeaderId: 'pm2',
    revenue: 500000,
    createdAt: '2024-10-01'
  },
  {
    id: 'p2',
    clientFullName: '华为技术有限公司',
    projectName: '华为云迁移项目',
    contractAmount: 800000,
    receivedAmount: 600000,
    developmentLeaderId: 'pm3',
    executionLeaderId: 'pm1',
    revenue: 800000,
    createdAt: '2024-09-15'
  },
  {
    id: 'p3',
    clientFullName: '比亚迪股份有限公司',
    projectName: '比亚迪ERP升级',
    contractAmount: 350000,
    receivedAmount: 350000,
    developmentLeaderId: 'pm2',
    executionLeaderId: 'pm3',
    revenue: 350000,
    createdAt: '2024-11-01'
  },
  {
    id: 'p4',
    clientFullName: '金沙江GPDD(上海未来/北京)',
    projectName: '金沙江GPDD项目',
    contractAmount: 280000,
    receivedAmount: 200000,
    developmentLeaderId: 'pm1',
    executionLeaderId: 'pm2',
    revenue: 280000,
    createdAt: '2024-12-01'
  },
  {
    id: 'p5',
    clientFullName: '玻色内控（客户/北京）',
    projectName: '玻色内控项目',
    contractAmount: 150000,
    receivedAmount: 100000,
    developmentLeaderId: 'pm2',
    executionLeaderId: 'pm3',
    revenue: 150000,
    createdAt: '2024-12-10'
  },
];

export const initialTimesheets: TimesheetEntry[] = [
  { id: 't1', userId: 'u1', projectId: 'p1', date: '2024-12-30', hours: 4, location: '北京', projectType: '需求分析', status: 'pending', period: 'morning' },
  { id: 't2', userId: 'u1', projectId: 'p2', date: '2024-12-30', hours: 4, location: '北京', projectType: '方案设计', status: 'pending', period: 'afternoon' },
  { id: 't3', userId: 'u1', projectId: 'p2', date: '2024-12-31', hours: 4, location: '深圳', projectType: '方案设计', status: 'approved', period: 'morning' },
  { id: 't4', userId: 'u2', projectId: 'p1', date: '2024-12-30', hours: 6, location: '北京', projectType: '系统开发', status: 'approved', period: 'morning' },
  { id: 't5', userId: 'u3', projectId: 'p3', date: '2024-12-31', hours: 8, location: '深圳', projectType: '测试验收', status: 'pending', period: 'morning' },
  { id: 't6', userId: 'u4', projectId: 'p5', date: '2024-12-30', hours: 8, location: '北京', projectType: '内控审计', status: 'approved', period: 'morning' },
  { id: 't7', userId: 'pm1', projectId: 'p1', date: '2024-12-30', hours: 4, location: '北京', projectType: '报告修改', status: 'approved', period: 'morning' },
  { id: 't8', userId: 'pm1', projectId: 'p4', date: '2024-12-30', hours: 4, location: '北京', projectType: '报销整理', status: 'approved', period: 'afternoon' },
];

export const initialExpenses: ExpenseEntry[] = [
  { id: 'e1', userId: 'u1', projectId: 'p1', date: '2024-12-30', category: '高铁', amount: 553, description: '北京-深圳', status: 'pending' },
  { id: 'e2', userId: 'u2', projectId: 'p2', date: '2024-12-29', category: '住宿', amount: 480, description: '华为园区酒店', status: 'approved' },
  { id: 'e3', userId: 'u1', projectId: 'p1', date: '2024-12-30', category: '餐费', amount: 120, description: '工作餐', status: 'pm_approved' },
  { id: 'e4', userId: 'u3', projectId: 'p3', date: '2024-12-28', category: '飞机', amount: 1200, description: '北京-深圳', status: 'secretary_approved' },
  { id: 'e5', userId: 'u4', projectId: 'p5', date: '2024-12-29', category: '出租', amount: 85, description: '机场到客户', status: 'approved' },
];

export const initialAssignments: StaffAssignment[] = [
  { id: 'a1', userId: 'pm1', projectId: 'p1', date: '2025-12-23', location: '北京' },
  { id: 'a2', userId: 'pm1', projectId: 'p4', date: '2025-12-24', location: '北京' },
  { id: 'a3', userId: 'pm2', projectId: 'p5', date: '2025-12-23', location: '北京' },
  { id: 'a4', userId: 'pm2', projectId: 'p5', date: '2025-12-24', location: '北京' },
  { id: 'a5', userId: 'pm3', projectId: 'p4', date: '2025-12-23', location: '北京' },
  { id: 'a6', userId: 'pm3', projectId: 'p2', date: '2025-12-24', location: '河南' },
  { id: 'a7', userId: 'u1', projectId: 'p1', date: '2025-12-23', location: '北京' },
  { id: 'a8', userId: 'u1', projectId: 'p2', date: '2025-12-24', location: '河南' },
  { id: 'a9', userId: 'u2', projectId: 'p1', date: '2025-12-23', location: '北京' },
  { id: 'a10', userId: 'u2', projectId: 'p1', date: '2025-12-24', location: '北京' },
  { id: 'a11', userId: 'u4', projectId: 'p5', date: '2025-12-23', location: '北京' },
  { id: 'a12', userId: 'u4', projectId: 'p5', date: '2025-12-24', location: '北京' },
  { id: 'a13', userId: 'u5', projectId: 'p4', date: '2025-12-23', location: '北京' },
  { id: 'a14', userId: 'u5', projectId: 'p4', date: '2025-12-24', location: '北京' },
  { id: 'a15', userId: 'intern1', projectId: '', date: '2025-12-23', location: 'Available' },
  { id: 'a16', userId: 'intern2', projectId: 'p4', date: '2025-12-23', location: '开封' },
];

export const initialCashReceipts: CashReceipt[] = [
  { id: 'cr1', projectId: 'p1', date: '2025-07-22', amount: 30000, remark: '' },
  { id: 'cr2', projectId: 'p2', date: '2025-08-01', amount: 50000, remark: '' },
  { id: 'cr3', projectId: 'p3', date: '2025-10-22', amount: 240000, remark: '分tax 4万' },
  { id: 'cr4', projectId: 'p4', date: '2025-10-24', amount: 150000, remark: '' },
];
