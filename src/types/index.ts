// v1.2 - Data models for GP Calculator
// Fixed: use 'export type' for verbatimModuleSyntax compatibility

export type Role = 'employee' | 'leader';

export type User = {
  id: string;
  name: string;
  role: Role;
  hourlyRate: number;
};

export type Project = {
  id: string;
  name: string;
  clientName: string;
  leaderId: string;
  revenue: number;
};

export type TimesheetEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type ExpenseEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  category: '住宿' | '餐饮' | '打车' | '高铁' | '机票' | '其他';
  amount: number;
  description: string;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type ProjectGrossProfit = {
  projectId: string;
  revenue: number;
  laborCost: number;
  travelExpense: number;
  grossProfit: number;
  margin: number;
};
