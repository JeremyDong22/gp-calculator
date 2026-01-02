// v3.3 - 咨询部项目管理系统数据模型
// 更新：差旅报销审核流程改为四级（报销人→执行负责人→秘书→部门负责人）

// 角色类型：员工、实习生、项目负责人、部门秘书、部门负责人
export type Role = 'employee' | 'intern' | 'project_manager' | 'secretary' | 'department_head';

// 性别
export type Gender = 'male' | 'female';

// 级别（认定年限）：0-20的数字
export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

// 项目状态：0未开始 → 1进行中 → 2项目完成 → 3开完发票 → 4已收款
export type ProjectStatus = 0 | 1 | 2 | 3 | 4;
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  0: '未开始',
  1: '进行中',
  2: '项目完成',
  3: '开完发票',
  4: '已收款'
};

// 用户/人员
export type User = {
  id: string;
  name: string;
  gender: Gender;
  role: Role;
  level: Level;
  annualSalary: number;      // 员工年薪包
  dailyWage: number;         // 员工工资（天）
  dailyRate: number;         // 员工费率（天）
  remark?: string;
  sortOrder: number;         // 排序顺序（用于拖拽）
  // 密码相关
  password: string;          // 密码（加密存储）
  isFirstLogin: boolean;     // 是否首次登录
};

// 项目
export type Project = {
  id: string;
  clientFullName: string;       // 委托方全称
  payer: string;                // 付款方
  projectShortName: string;     // 项目简称
  contractAmount: number;       // 合同金额
  confirmedReceipt: number;     // 部门确认的收款（从现金收款表推送）
  developmentLeaderId: string;  // 开发负责人ID（可为自定义名称）
  developmentLeaderName?: string; // 开发负责人名称（外部人员时使用）
  executionLeaderId: string;    // 执行负责人ID（可为自定义名称）
  executionLeaderName?: string; // 执行负责人名称（外部人员时使用）
  status: ProjectStatus;        // 项目状态
  completionDate?: string;      // 项目完成日期
  createdAt: string;
};

// 工时条目
export type TimesheetEntry = {
  id: string;
  userId: string;
  projectId: string;
  startDate: string;           // 开始日期（从人员安排推送）
  endDate: string;             // 结束日期（从人员安排推送）
  totalHours: number;          // 累计工时（员工填写）
  location: string;            // 工作地点
  status: 'pending' | 'approved' | 'rejected';
  // 审批信息
  approvalInfo?: {
    approverId: string;
    approverName: string;
    approvalDate: string;
    comment?: string;
  };
};

// 差旅费用类型
export type ExpenseCategory = '高铁' | '飞机' | '打车' | '公交' | '餐费' | '住宿' | '其他';

// 差旅报销条目
export type ExpenseEntry = {
  id: string;
  projectId: string;           // 项目排在报销人左边
  userId: string;              // 报销人
  date: string;                // 报销日期
  location?: string;           // 地点（保留字段但不显示）
  category: ExpenseCategory;
  amount: number;
  description: string;
  status: 'pending' | 'executor_approved' | 'secretary_approved' | 'approved' | 'rejected';
  // 四级审批：报销人提交 → 执行负责人审核 → 秘书审核 → 部门负责人审核
  executorApproval?: { approved: boolean; date: string; approverId: string; comment: string; };
  secretaryApproval?: { approved: boolean; date: string; approverId: string; comment: string; };
  headApproval?: { approved: boolean; date: string; approverId: string; comment: string; };
};

// 人员安排（支持每天多个项目）
export type StaffAssignment = {
  id: string;
  userId: string;
  date: string;
  // 支持多个项目安排
  assignments: {
    projectId: string;         // 项目ID或"custom"
    customProjectName?: string; // 自定义项目名称
    location: string;
  }[];
};

// 现金收款记录（重新设计）
export type CashReceipt = {
  id: string;
  projectId: string;
  receiptDate: string;         // 收款日期
  payer: string;               // 付款方
  executionLeaderId: string;   // 执行负责人（从项目建项推送）
  financeReceipt: number;      // 财务部的收款
  confirmedReceipt: number;    // 部门确认的收款
  developmentSplit: number;    // 开发拆分
  departmentSplit: number;     // 部门拆分
  otherSplit: number;          // 其他拆分
  adjustedReceipt: number;     // 调整后收款 = 部门确认收款 - 开发拆分 - 部门拆分 - 其他拆分
  invoiceDate?: string;        // 开票日期（触发项目状态变为"开完发票"）
  remark?: string;
};

// 执行负责人颜色配置
export type ExecutorColorConfig = {
  id: string;
  executorId: string;          // 执行负责人ID
  executorName: string;        // 执行负责人名称
  color: string;               // 颜色值（如 #3B82F6）
};

// 项目类型
export type ProjectType = '财务尽调' | 'GPDD' | 'GPDD+财务尽调' | '业务尽调' | '财务尽调+专项审计' | '其他';
export const PROJECT_TYPE_OPTIONS: ProjectType[] = ['财务尽调', 'GPDD', 'GPDD+财务尽调', '业务尽调', '财务尽调+专项审计', '其他'];

// 报告发出状态
export type ReportStatus = 'N' | '初稿' | '终稿';
export const REPORT_STATUS_OPTIONS: ReportStatus[] = ['N', '初稿', '终稿'];

// 项目控制表条目（每个执行负责人一张表）
export type ProjectControlEntry = {
  id: string;
  projectId: string;           // 关联项目ID
  executorId: string;          // 执行负责人ID（用于分表）
  // 项目信息（手动维护）
  clientContact: string;       // 委托方联系人
  projectType: ProjectType;    // 项目类型
  // 合同信息（手动维护）
  contractSent: boolean;       // 合同已经发出 Y/N
  contractReceived: boolean;   // 盖章合同已经收回 Y/N
  reportStatus: ReportStatus;  // 初版/终版报告发出 N/初稿/终稿
  badDebt: number;             // 坏账
  // 备注
  remark: string;              // 备注
};

// 项目毛利分析
export type ProjectGrossProfit = {
  projectId: string;
  projectShortName: string;
  contractRevenue: number;     // 合同收入
  laborCost: number;           // 人工成本 = 工时 × 员工工资(天) ÷ 8
  laborCostRate: number;       // 人工成本率
  travelExpense: number;       // 差旅费
  travelExpenseRate: number;   // 差旅费率
  grossProfit: number;         // 毛利
  margin: number;              // 毛利率
  completionDate?: string;     // 项目完成日期
};

// 工时汇总
export type TimesheetSummary = {
  projectId: string;
  projectShortName: string;
  userId: string;
  userName: string;
  totalHours: number;
};

// 保留旧类型以兼容（将在后续版本删除）
export type BonusCalculation = {
  id: string;
  userId: string;
  projectId: string;
  projectContractRevenue: number;
  totalProjectHours: number;
  employeeProjectHours: number;
  employeeSplitRatio: number;
  employeeSplitRevenue: number;
  splitBenefit: number;
  month: string;
  monthlySalary: number;
  totalSalary: number;
  bonus: number;
};

export type DepartmentProfit = {
  period: string;
  totalRevenue: number;
  totalLaborCost: number;
  totalTravelExpense: number;
  totalOtherCost: number;
  grossProfit: number;
  netProfit: number;
};
