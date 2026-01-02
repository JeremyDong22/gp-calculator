// v2.0 - 咨询部项目管理系统数据模型
// 更新：5种角色、项目建项扩展、人员建项、人员安排、现金收款、奖金计算等

// 角色类型：员工、实习生、项目负责人、部门秘书、部门负责人
export type Role = 'employee' | 'intern' | 'project_manager' | 'secretary' | 'department_head';

// 性别
export type Gender = 'male' | 'female';

// 级别
export type Level = 'junior' | 'mid' | 'senior' | 'expert';

// 用户/人员
export type User = {
  id: string;
  name: string;
  gender: Gender;
  role: Role;
  hourlyRate: number;  // 费率，仅部门负责人可见
  level: Level;
  remark?: string;
};

// 项目
export type Project = {
  id: string;
  clientFullName: string;      // 委托方全称
  projectName: string;         // 项目名称
  contractAmount: number;      // 合同金额
  receivedAmount: number;      // 收款金额（仅部门负责人可输入）
  developmentLeaderId: string; // 开发负责人
  executionLeaderId: string;   // 执行负责人
  revenue: number;             // 收入
  createdAt: string;
};

// 工时条目
export type TimesheetEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  location: string;           // 工作地点
  projectType: string;        // 项目类型（原描述）
  status: 'pending' | 'approved' | 'rejected';
  period: 'morning' | 'afternoon' | 'evening';  // 时段
};

// 差旅费用类型
export type ExpenseCategory = '住宿' | '飞机' | '高铁' | '出租' | '餐费' | '其他';

// 差旅报销条目
export type ExpenseEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  status: 'pending' | 'pm_approved' | 'secretary_approved' | 'approved' | 'rejected';
  // 三级审批状态
  pmApproval?: { approved: boolean; date: string; };
  secretaryApproval?: { approved: boolean; date: string; };
  headApproval?: { approved: boolean; date: string; };
};

// 人员安排
export type StaffAssignment = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  location: string;
};

// 现金收款记录
export type CashReceipt = {
  id: string;
  projectId: string;
  receiptDate: string;
  payer: string;                    // 付款方
  projectManagerId: string;         // 项目负责人
  financeReceipt: number;           // 财务部的收款
  departmentConfirmedReceipt: number; // 部门确认的收款（项目负责人可输入）
  developmentSplit: number;         // 开发拆分
  departmentSplit: number;          // 部门拆分
  otherSplit: number;               // 其他拆分
  adjustedReceipt: number;          // 调整后收款 = A - B - C - D
  remark?: string;
};

// 员工奖金计算
export type BonusCalculation = {
  id: string;
  userId: string;
  projectId: string;
  projectContractRevenue: number;   // 项目合同收入
  totalProjectHours: number;        // 所有人输入的该项目工时汇总
  employeeProjectHours: number;     // 员工在该项目上工时
  employeeSplitRatio: number;       // 员工分拆比例 = 员工工时/总工时
  employeeSplitRevenue: number;     // 员工分拆项目收入
  splitBenefit: number;             // 分拆收益
  month: string;                    // 月份
  monthlySalary: number;            // 月工资
  totalSalary: number;              // 工资总额
  bonus: number;                    // 奖金 = 分拆收益 - 工资总额
};

// 项目毛利分析
export type ProjectGrossProfit = {
  projectId: string;
  revenue: number;
  laborCost: number;
  laborCostRate: number;      // 人工成本率 = 人工成本/收入
  travelExpense: number;
  travelExpenseRate: number;  // 差旅费率 = 差旅/收入
  grossProfit: number;
  margin: number;
};

// 部门利润
export type DepartmentProfit = {
  period: string;
  totalRevenue: number;
  totalLaborCost: number;
  totalTravelExpense: number;
  totalOtherCost: number;
  grossProfit: number;
  netProfit: number;
};
