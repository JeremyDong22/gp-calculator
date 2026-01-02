// v3.1 - 咨询部项目管理系统Mock数据
// 更新：新增项目控制表初始数据
import type { User, Project, TimesheetEntry, ExpenseEntry, StaffAssignment, CashReceipt, ExecutorColorConfig, ProjectControlEntry, Level } from '../types';

// 初始密码（加密后存储，这里简化为明文）
const DEFAULT_PASSWORD = '123456';

// 人员数据（按图片1中的真实数据）
export const users: User[] = [
  // 部门负责人
  { id: 'head1', name: '章怡', gender: 'female', role: 'department_head', level: 30 as Level, annualSalary: 1200000, dailyWage: 4500, dailyRate: 7000, remark: '部门负责人', sortOrder: 1, password: DEFAULT_PASSWORD, isFirstLogin: true },

  // 项目负责人（按级别排序）
  { id: 'pm1', name: '傅曲博', gender: 'male', role: 'project_manager', level: 25 as Level, annualSalary: 800000, dailyWage: 3000, dailyRate: 4500, remark: '', sortOrder: 2, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'pm2', name: '李胜男', gender: 'female', role: 'project_manager', level: 25 as Level, annualSalary: 800000, dailyWage: 3000, dailyRate: 4500, remark: '', sortOrder: 3, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'pm3', name: '刘宽', gender: 'male', role: 'project_manager', level: 25 as Level, annualSalary: 800000, dailyWage: 3000, dailyRate: 4500, remark: '', sortOrder: 4, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'pm4', name: '郭瑞刚', gender: 'male', role: 'project_manager', level: 25 as Level, annualSalary: 800000, dailyWage: 3000, dailyRate: 4500, remark: '', sortOrder: 5, password: DEFAULT_PASSWORD, isFirstLogin: true },

  // 员工（按级别和年薪排序）
  { id: 'u1', name: '淮剑', gender: 'male', role: 'employee', level: 15 as Level, annualSalary: 300000, dailyWage: 1200, dailyRate: 1800, remark: '', sortOrder: 6, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u2', name: '段志琴', gender: 'female', role: 'employee', level: 12 as Level, annualSalary: 200000, dailyWage: 800, dailyRate: 1200, remark: '', sortOrder: 7, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u3', name: '彭颖超', gender: 'male', role: 'employee', level: 12 as Level, annualSalary: 200000, dailyWage: 800, dailyRate: 1200, remark: '', sortOrder: 8, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u4', name: '刘治良', gender: 'male', role: 'employee', level: 12 as Level, annualSalary: 200000, dailyWage: 800, dailyRate: 1200, remark: '', sortOrder: 9, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u5', name: '李雨颖', gender: 'female', role: 'employee', level: 12 as Level, annualSalary: 200000, dailyWage: 800, dailyRate: 1200, remark: '', sortOrder: 10, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u6', name: '张峻赫', gender: 'male', role: 'employee', level: 12 as Level, annualSalary: 200000, dailyWage: 800, dailyRate: 1200, remark: '', sortOrder: 11, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u7', name: '宋毅堃', gender: 'male', role: 'employee', level: 10 as Level, annualSalary: 160000, dailyWage: 600, dailyRate: 900, remark: '', sortOrder: 12, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u8', name: '候美晨', gender: 'female', role: 'employee', level: 10 as Level, annualSalary: 160000, dailyWage: 600, dailyRate: 900, remark: '', sortOrder: 13, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u9', name: '于霏', gender: 'female', role: 'employee', level: 10 as Level, annualSalary: 160000, dailyWage: 600, dailyRate: 900, remark: '', sortOrder: 14, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'u10', name: '吴梓璇', gender: 'female', role: 'employee', level: 10 as Level, annualSalary: 160000, dailyWage: 600, dailyRate: 900, remark: '', sortOrder: 15, password: DEFAULT_PASSWORD, isFirstLogin: true },

  // 实习生
  { id: 'intern1', name: '张悦', gender: 'female', role: 'intern', level: 5 as Level, annualSalary: 100000, dailyWage: 400, dailyRate: 600, remark: '', sortOrder: 16, password: DEFAULT_PASSWORD, isFirstLogin: true },
  { id: 'intern2', name: '张怡雯', gender: 'female', role: 'intern', level: 5 as Level, annualSalary: 100000, dailyWage: 400, dailyRate: 600, remark: '', sortOrder: 17, password: DEFAULT_PASSWORD, isFirstLogin: true },

  // 秘书（放在最后）
  { id: 'sec1', name: '刘珍', gender: 'female', role: 'secretary', level: 8 as Level, annualSalary: 100000, dailyWage: 400, dailyRate: 600, remark: '部门秘书', sortOrder: 18, password: DEFAULT_PASSWORD, isFirstLogin: true },
];

// 项目数据
export const projects: Project[] = [
  {
    id: 'p1',
    clientFullName: '北京深势科技有限公司',
    payer: '北京深势科技有限公司',
    projectShortName: '深势科技',
    contractAmount: 30000,
    confirmedReceipt: 30000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-07-20',
    createdAt: '2025-06-01'
  },
  {
    id: 'p2',
    clientFullName: '浙江省金投科创母基金一期股权投资合伙企业（有限合伙）',
    payer: '浙江省金投科创母基金一期股权投资合伙企业（有限合伙）',
    projectShortName: '浙江金投',
    contractAmount: 50000,
    confirmedReceipt: 50000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-07-30',
    createdAt: '2025-07-01'
  },
  {
    id: 'p3',
    clientFullName: '无锡泰华清森企业管理合伙企业',
    payer: '无锡泰华清森企业管理合伙企业',
    projectShortName: '泰华清森',
    contractAmount: 240000,
    confirmedReceipt: 240000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-10-20',
    createdAt: '2025-09-01'
  },
  {
    id: 'p4',
    clientFullName: '北京盈科壹号股权投资基金',
    payer: '北京盈科壹号股权投资基金',
    projectShortName: '盈科壹号',
    contractAmount: 150000,
    confirmedReceipt: 150000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-10-22',
    createdAt: '2025-09-15'
  },
  {
    id: 'p5',
    clientFullName: '北京盈科华顺股权投资基金',
    payer: '北京盈科华顺股权投资基金',
    projectShortName: '盈科华顺',
    contractAmount: 30000,
    confirmedReceipt: 30000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-10-22',
    createdAt: '2025-09-15'
  },
  {
    id: 'p6',
    clientFullName: '北京盈科贰号股权投资基金',
    payer: '北京盈科贰号股权投资基金',
    projectShortName: '盈科贰号',
    contractAmount: 120000,
    confirmedReceipt: 120000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-10-22',
    createdAt: '2025-09-15'
  },
  {
    id: 'p7',
    clientFullName: '中网投（上海）',
    payer: '中网投（上海）',
    projectShortName: '中网投',
    contractAmount: 50000,
    confirmedReceipt: 50000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-10-30',
    createdAt: '2025-10-01'
  },
  {
    id: 'p8',
    clientFullName: '上海深至信息科技有限公司',
    payer: '上海深至信息科技有限公司',
    projectShortName: '深至信息',
    contractAmount: 50000,
    confirmedReceipt: 50000,
    developmentLeaderId: 'pm4',
    executionLeaderId: 'pm4',
    status: 4,
    completionDate: '2025-11-18',
    createdAt: '2025-10-15'
  },
  // 进行中的项目
  {
    id: 'p9',
    clientFullName: '宁德时代新能源科技股份有限公司',
    payer: '宁德时代新能源科技股份有限公司',
    projectShortName: '宁德时代',
    contractAmount: 500000,
    confirmedReceipt: 0,
    developmentLeaderId: 'pm1',
    executionLeaderId: 'pm2',
    status: 1,
    createdAt: '2025-12-01'
  },
  {
    id: 'p10',
    clientFullName: '华为技术有限公司',
    payer: '华为技术有限公司',
    projectShortName: '华为云迁移',
    contractAmount: 800000,
    confirmedReceipt: 0,
    developmentLeaderId: 'pm3',
    executionLeaderId: 'pm1',
    status: 1,
    createdAt: '2025-12-10'
  },
];

// 工时数据（新格式）
export const initialTimesheets: TimesheetEntry[] = [
  { id: 't1', userId: 'u1', projectId: 'p9', startDate: '2025-12-23', endDate: '2025-12-27', totalHours: 40, location: '北京', status: 'pending' },
  { id: 't2', userId: 'u2', projectId: 'p9', startDate: '2025-12-23', endDate: '2025-12-25', totalHours: 24, location: '北京', status: 'approved', approvalInfo: { approverId: 'pm2', approverName: '李胜男', approvalDate: '2025-12-26', comment: '同意' } },
  { id: 't3', userId: 'u3', projectId: 'p10', startDate: '2025-12-23', endDate: '2025-12-27', totalHours: 40, location: '深圳', status: 'pending' },
  { id: 't4', userId: 'pm1', projectId: 'p9', startDate: '2025-12-20', endDate: '2025-12-24', totalHours: 32, location: '北京', status: 'approved', approvalInfo: { approverId: 'head1', approverName: '章怡', approvalDate: '2025-12-25', comment: '' } },
];

// 差旅报销数据（新格式）
export const initialExpenses: ExpenseEntry[] = [
  { id: 'e1', projectId: 'p9', userId: 'u1', date: '2025-12-23', category: '高铁', amount: 553, description: '北京-深圳', status: 'pending' },
  { id: 'e2', projectId: 'p9', userId: 'u1', date: '2025-12-23', category: '住宿', amount: 480, description: '深圳酒店', status: 'user_confirmed', userConfirmation: { confirmed: true, date: '2025-12-24' } },
  { id: 'e3', projectId: 'p10', userId: 'u3', date: '2025-12-24', category: '飞机', amount: 1200, description: '北京-深圳', status: 'executor_approved', userConfirmation: { confirmed: true, date: '2025-12-24' }, executorApproval: { approved: true, date: '2025-12-25', approverId: 'pm1', comment: '同意报销' } },
  { id: 'e4', projectId: 'p9', userId: 'u2', date: '2025-12-25', category: '打车', amount: 85, description: '机场到客户', status: 'approved', userConfirmation: { confirmed: true, date: '2025-12-25' }, executorApproval: { approved: true, date: '2025-12-26', approverId: 'pm2', comment: '' }, headApproval: { approved: true, date: '2025-12-27', approverId: 'head1', comment: '' } },
  { id: 'e5', projectId: 'p10', userId: 'u3', date: '2025-12-26', category: '餐费', amount: 120, description: '工作餐', status: 'pending' },
];

// 人员安排数据（新格式：支持每天多个项目）
export const initialAssignments: StaffAssignment[] = [
  { id: 'a1', userId: 'pm1', date: '2025-12-23', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a2', userId: 'pm1', date: '2025-12-24', assignments: [{ projectId: 'p9', location: '北京' }, { projectId: 'p10', location: '深圳' }] },
  { id: 'a3', userId: 'pm2', date: '2025-12-23', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a4', userId: 'pm2', date: '2025-12-24', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a5', userId: 'pm3', date: '2025-12-23', assignments: [{ projectId: 'p10', location: '深圳' }] },
  { id: 'a6', userId: 'pm3', date: '2025-12-24', assignments: [{ projectId: 'p10', location: '深圳' }] },
  { id: 'a7', userId: 'u1', date: '2025-12-23', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a8', userId: 'u1', date: '2025-12-24', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a9', userId: 'u2', date: '2025-12-23', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a10', userId: 'u2', date: '2025-12-24', assignments: [{ projectId: 'p9', location: '北京' }] },
  { id: 'a11', userId: 'u3', date: '2025-12-23', assignments: [{ projectId: 'p10', location: '深圳' }] },
  { id: 'a12', userId: 'u3', date: '2025-12-24', assignments: [{ projectId: 'p10', location: '深圳' }] },
  { id: 'a13', userId: 'intern1', date: '2025-12-23', assignments: [{ projectId: 'custom', customProjectName: '内部培训', location: '北京' }] },
  { id: 'a14', userId: 'intern2', date: '2025-12-23', assignments: [{ projectId: 'p9', location: '北京' }] },
];

// 现金收款数据（按图片2重新设计）
export const initialCashReceipts: CashReceipt[] = [
  { id: 'cr1', projectId: 'p1', receiptDate: '2025-07-22', payer: '北京深势科技有限公司', executionLeaderId: 'pm4', financeReceipt: 30000, confirmedReceipt: 30000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 30000, remark: '' },
  { id: 'cr2', projectId: 'p2', receiptDate: '2025-08-01', payer: '浙江省金投科创母基金一期股权投资合伙企业（有限合伙）', executionLeaderId: 'pm4', financeReceipt: 50000, confirmedReceipt: 50000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 50000, remark: '' },
  { id: 'cr3', projectId: 'p3', receiptDate: '2025-10-22', payer: '无锡泰华清森企业管理合伙企业', executionLeaderId: 'pm4', financeReceipt: 240000, confirmedReceipt: 240000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 240000, remark: '分tax 4万' },
  { id: 'cr4', projectId: 'p4', receiptDate: '2025-10-24', payer: '北京盈科壹号股权投资基金', executionLeaderId: 'pm4', financeReceipt: 150000, confirmedReceipt: 150000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 150000, remark: '' },
  { id: 'cr5', projectId: 'p5', receiptDate: '2025-10-24', payer: '北京盈科华顺股权投资基金', executionLeaderId: 'pm4', financeReceipt: 30000, confirmedReceipt: 30000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 30000, remark: '' },
  { id: 'cr6', projectId: 'p6', receiptDate: '2025-10-24', payer: '北京盈科贰号股权投资基金', executionLeaderId: 'pm4', financeReceipt: 120000, confirmedReceipt: 120000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 120000, remark: '' },
  { id: 'cr7', projectId: 'p7', receiptDate: '2025-10-31', payer: '中网投（上海）', executionLeaderId: 'pm4', financeReceipt: 50000, confirmedReceipt: 50000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 50000, remark: '' },
  { id: 'cr8', projectId: 'p8', receiptDate: '2025-11-20', payer: '上海深至信息科技有限公司', executionLeaderId: 'pm4', financeReceipt: 50000, confirmedReceipt: 50000, developmentSplit: 0, departmentSplit: 0, otherSplit: 0, adjustedReceipt: 50000, remark: '' },
];

// 执行负责人颜色配置（按PRD要求）
export const initialExecutorColors: ExecutorColorConfig[] = [
  { id: 'ec1', executorId: 'pm3', executorName: '刘宽', color: '#3B82F6' },      // 蓝色
  { id: 'ec2', executorId: 'pm4', executorName: '郭瑞刚', color: '#22C55E' },    // 绿色
  { id: 'ec3', executorId: 'pm2', executorName: '李胜男', color: '#FDB5B5' },    // 淡粉色
  { id: 'ec4', executorId: 'pm1', executorName: '傅曲博', color: '#D1D5DB' },    // 浅灰色
];

// 项目控制表初始数据
export const initialProjectControls: ProjectControlEntry[] = [
  { id: 'pc1', projectId: 'p1', executorId: 'pm4', clientContact: '张经理', projectType: '财务尽调', contractSent: true, contractReceived: true, reportStatus: '终稿', badDebt: 0, remark: '' },
  { id: 'pc2', projectId: 'p2', executorId: 'pm4', clientContact: '李总', projectType: '财务尽调', contractSent: true, contractReceived: true, reportStatus: '终稿', badDebt: 0, remark: '' },
  { id: 'pc3', projectId: 'p9', executorId: 'pm2', clientContact: '王工', projectType: 'GPDD+财务尽调', contractSent: true, contractReceived: false, reportStatus: 'N', badDebt: 0, remark: '进行中' },
  { id: 'pc4', projectId: 'p10', executorId: 'pm1', clientContact: '陈总监', projectType: 'GPDD', contractSent: true, contractReceived: true, reportStatus: '初稿', badDebt: 0, remark: '进行中' },
];
