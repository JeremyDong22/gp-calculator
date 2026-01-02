// v3.1 - 数据层API接口定义
// 为后续Supabase集成预留的接口层，目前使用mock实现
import type { User, Project, TimesheetEntry, ExpenseEntry, StaffAssignment, CashReceipt, ExecutorColorConfig } from '../types';

// API响应类型
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// 用户API接口
export interface UserApi {
  getAll(): Promise<ApiResponse<User[]>>;
  getById(id: string): Promise<ApiResponse<User>>;
  create(user: Omit<User, 'id' | 'sortOrder' | 'password' | 'isFirstLogin'>): Promise<ApiResponse<User>>;
  update(id: string, updates: Partial<User>): Promise<ApiResponse<User>>;
  delete(id: string): Promise<ApiResponse<void>>;
  reorder(userIds: string[]): Promise<ApiResponse<void>>;
  validatePassword(id: string, password: string): Promise<ApiResponse<boolean>>;
  changePassword(id: string, newPassword: string): Promise<ApiResponse<void>>;
  resetPassword(id: string): Promise<ApiResponse<void>>;
}

// 项目API接口
export interface ProjectApi {
  getAll(): Promise<ApiResponse<Project[]>>;
  getById(id: string): Promise<ApiResponse<Project>>;
  create(project: Omit<Project, 'id' | 'createdAt' | 'status' | 'confirmedReceipt'>): Promise<ApiResponse<Project>>;
  update(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>>;
  delete(id: string): Promise<ApiResponse<void>>;
  updateStatus(id: string, status: Project['status']): Promise<ApiResponse<Project>>;
}

// 工时API接口
export interface TimesheetApi {
  getAll(): Promise<ApiResponse<TimesheetEntry[]>>;
  getByUser(userId: string): Promise<ApiResponse<TimesheetEntry[]>>;
  getByProject(projectId: string): Promise<ApiResponse<TimesheetEntry[]>>;
  create(entry: Omit<TimesheetEntry, 'id' | 'status'>): Promise<ApiResponse<TimesheetEntry>>;
  update(id: string, updates: Partial<TimesheetEntry>): Promise<ApiResponse<TimesheetEntry>>;
  delete(id: string): Promise<ApiResponse<void>>;
  approve(id: string, approverId: string, approverName: string, comment?: string): Promise<ApiResponse<TimesheetEntry>>;
  reject(id: string, approverId: string, approverName: string, comment?: string): Promise<ApiResponse<TimesheetEntry>>;
}

// 差旅报销API接口
export interface ExpenseApi {
  getAll(): Promise<ApiResponse<ExpenseEntry[]>>;
  getByUser(userId: string): Promise<ApiResponse<ExpenseEntry[]>>;
  getByProject(projectId: string): Promise<ApiResponse<ExpenseEntry[]>>;
  create(entry: Omit<ExpenseEntry, 'id' | 'status'>): Promise<ApiResponse<ExpenseEntry>>;
  update(id: string, updates: Partial<ExpenseEntry>): Promise<ApiResponse<ExpenseEntry>>;
  delete(id: string): Promise<ApiResponse<void>>;
  confirmByUser(id: string): Promise<ApiResponse<ExpenseEntry>>;
  approveByExecutor(id: string, approverId: string, comment: string): Promise<ApiResponse<ExpenseEntry>>;
  approveByHead(id: string, approverId: string, comment: string): Promise<ApiResponse<ExpenseEntry>>;
  reject(id: string, approverId: string, comment: string): Promise<ApiResponse<ExpenseEntry>>;
}

// 人员安排API接口
export interface AssignmentApi {
  getAll(): Promise<ApiResponse<StaffAssignment[]>>;
  getByUser(userId: string): Promise<ApiResponse<StaffAssignment[]>>;
  getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<StaffAssignment[]>>;
  create(assignment: Omit<StaffAssignment, 'id'>): Promise<ApiResponse<StaffAssignment>>;
  update(id: string, updates: Partial<StaffAssignment>): Promise<ApiResponse<StaffAssignment>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

// 现金收款API接口
export interface CashReceiptApi {
  getAll(): Promise<ApiResponse<CashReceipt[]>>;
  getByProject(projectId: string): Promise<ApiResponse<CashReceipt[]>>;
  create(receipt: Omit<CashReceipt, 'id' | 'adjustedReceipt'>): Promise<ApiResponse<CashReceipt>>;
  update(id: string, updates: Partial<CashReceipt>): Promise<ApiResponse<CashReceipt>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

// 执行负责人颜色配置API接口
export interface ExecutorColorApi {
  getAll(): Promise<ApiResponse<ExecutorColorConfig[]>>;
  create(config: Omit<ExecutorColorConfig, 'id'>): Promise<ApiResponse<ExecutorColorConfig>>;
  update(id: string, updates: Partial<ExecutorColorConfig>): Promise<ApiResponse<ExecutorColorConfig>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

// 统一API接口
export interface DataApi {
  users: UserApi;
  projects: ProjectApi;
  timesheets: TimesheetApi;
  expenses: ExpenseApi;
  assignments: AssignmentApi;
  cashReceipts: CashReceiptApi;
  executorColors: ExecutorColorApi;
}

// Mock实现（当前使用）
export const createMockApi = (): DataApi => {
  // 实际实现在DataContext中，这里只是接口定义
  // 后续可替换为Supabase实现
  throw new Error('Mock API should be implemented in DataContext');
};

// Supabase实现（预留）
export const createSupabaseApi = (_supabaseClient: unknown): DataApi => {
  // TODO: 实现Supabase数据层
  throw new Error('Supabase API not implemented yet');
};
