// v3.4 - 项目控制表组件（按执行负责人分表，权限控制）
// 功能：执行负责人只能看到和编辑自己的项目，部门负责人可以看到所有项目
// 更新：开票改为checkbox，项目名称改为项目简称，联系人可编辑，交通费和其他从差旅报销推送
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_OPTIONS, REPORT_STATUS_OPTIONS } from '../types';
import type { ProjectControlEntry, ProjectType, ReportStatus, ExpenseCategory } from '../types';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#f8fafc',
  fontSize: '0.75rem',
  width: '100%',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.25rem',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '0.7rem',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  background: 'rgba(30, 41, 59, 0.98)',
  zIndex: 10,
  borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
  whiteSpace: 'nowrap',
};

const thGroupStyle: React.CSSProperties = {
  ...thStyle,
  background: 'rgba(6, 214, 160, 0.1)',
  color: '#06d6a0',
};

const tdStyle: React.CSSProperties = {
  padding: '0.25rem',
  fontSize: '0.75rem',
  borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
  verticalAlign: 'middle',
};

const checkboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  accentColor: '#06d6a0',
};

// 差旅费用分类映射
const TRANSPORT_CATEGORIES: ExpenseCategory[] = ['高铁', '飞机', '打车', '公交'];

export function ProjectControlPanel() {
  const { projects, users, projectControls, expenses, cashReceipts, updateProjectControl, getOrCreateProjectControl } = useData();
  const { currentUser, isDepartmentHead } = useAuth();

  // 获取所有执行负责人（部门负责人可见所有，执行负责人只能看到自己）
  const executors = useMemo(() => {
    const executorIds = [...new Set(projects.map(p => p.executionLeaderId))];
    const allExecutors = executorIds.map(id => {
      const user = users.find(u => u.id === id);
      return { id, name: user?.name || id };
    });

    // 如果不是部门负责人，只返回当前用户
    if (!isDepartmentHead && currentUser) {
      return allExecutors.filter(e => e.id === currentUser.id);
    }
    return allExecutors;
  }, [projects, users, isDepartmentHead, currentUser]);

  const [selectedExecutorId, setSelectedExecutorId] = useState<string>(
    isDepartmentHead ? executors[0]?.id || '' : currentUser?.id || ''
  );

  // 获取当前执行负责人的项目
  const executorProjects = useMemo(() => {
    return projects.filter(p => p.executionLeaderId === selectedExecutorId);
  }, [projects, selectedExecutorId]);

  // 获取项目差旅费用分类汇总（按项目简称匹配）
  const getProjectExpenseBreakdown = (projectShortName: string) => {
    const projectExpenses = expenses.filter(e => {
      const project = projects.find(p => p.id === e.projectId);
      return project?.projectShortName === projectShortName && e.status === 'approved';
    });
    const transport = projectExpenses.filter(e => TRANSPORT_CATEGORIES.includes(e.category)).reduce((s, e) => s + e.amount, 0);
    const accommodation = projectExpenses.filter(e => e.category === '住宿').reduce((s, e) => s + e.amount, 0);
    const meals = projectExpenses.filter(e => e.category === '餐费').reduce((s, e) => s + e.amount, 0);
    const other = projectExpenses.filter(e => e.category === '其他').reduce((s, e) => s + e.amount, 0);
    const total = transport + accommodation + meals + other;
    return { transport, accommodation, meals, other, total };
  };

  // 获取项目收款信息
  const getProjectReceipt = (projectId: string) => {
    const receipts = cashReceipts.filter(r => r.projectId === projectId);
    const confirmedReceipt = receipts.reduce((sum, r) => sum + r.confirmedReceipt, 0);
    const hasInvoice = receipts.some(r => r.invoiceDate);
    return { confirmedReceipt, hasInvoice };
  };

  // 获取或创建控制表条目
  const getControlEntry = (projectId: string): ProjectControlEntry => {
    const existing = projectControls.find(c => c.projectId === projectId && c.executorId === selectedExecutorId);
    if (existing) return existing;
    return getOrCreateProjectControl(projectId, selectedExecutorId);
  };

  // 更新控制表字段
  const handleUpdate = (projectId: string, field: keyof ProjectControlEntry, value: string | boolean | number) => {
    const entry = getControlEntry(projectId);
    updateProjectControl(entry.id, { [field]: value });
  };

  // 导出Excel
  const handleExport = () => {
    const executorName = executors.find(e => e.id === selectedExecutorId)?.name || '';
    const headers = ['序号', '项目简称', '委托方(全称)', '完成时间', '联系人', '项目类型', '项目状态', '合同发出', '盖章收回', '报告状态', '已开票', '合同金额', '回款金额', '坏账', '欠款金额', '交通费', '住宿', '餐饮', '其他', '差旅合计', '占收入%', '备注'];

    const rows = executorProjects.map((p, idx) => {
      const control = getControlEntry(p.id);
      const receipt = getProjectReceipt(p.id);
      const expense = getProjectExpenseBreakdown(p.projectShortName);
      const debt = p.contractAmount - receipt.confirmedReceipt - control.badDebt;
      const expenseRate = p.contractAmount > 0 ? (expense.total / p.contractAmount * 100).toFixed(1) + '%' : '-';

      return [
        idx + 1, p.projectShortName, p.payer, p.completionDate || '', control.clientContact, control.projectType,
        PROJECT_STATUS_LABELS[p.status], control.contractSent ? 'Y' : 'N', control.contractReceived ? 'Y' : 'N',
        control.reportStatus, receipt.hasInvoice ? 'Y' : 'N', p.contractAmount, receipt.confirmedReceipt,
        control.badDebt, debt, expense.transport, expense.accommodation, expense.meals, expense.other,
        expense.total, expenseRate, control.remark,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${executorName}项目控制表.csv`;
    link.click();
  };

  // 计算汇总
  const totals = useMemo(() => {
    return executorProjects.reduce((acc, p) => {
      const control = getControlEntry(p.id);
      const receipt = getProjectReceipt(p.id);
      const expense = getProjectExpenseBreakdown(p.projectShortName);
      const debt = p.contractAmount - receipt.confirmedReceipt - control.badDebt;
      return {
        contractAmount: acc.contractAmount + p.contractAmount,
        confirmedReceipt: acc.confirmedReceipt + receipt.confirmedReceipt,
        badDebt: acc.badDebt + control.badDebt,
        debt: acc.debt + debt,
        transport: acc.transport + expense.transport,
        accommodation: acc.accommodation + expense.accommodation,
        meals: acc.meals + expense.meals,
        other: acc.other + expense.other,
        expenseTotal: acc.expenseTotal + expense.total,
        projectCount: acc.projectCount + 1,
      };
    }, { contractAmount: 0, confirmedReceipt: 0, badDebt: 0, debt: 0, transport: 0, accommodation: 0, meals: 0, other: 0, expenseTotal: 0, projectCount: 0 });
  }, [executorProjects, projectControls, cashReceipts, expenses]);

  const selectedExecutorName = executors.find(e => e.id === selectedExecutorId)?.name || '';

  return (
    <div>
      {/* 执行负责人选择器 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {executors.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedExecutorId(e.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedExecutorId === e.id ? 'linear-gradient(135deg, #06d6a0, #118ab2)' : 'rgba(30, 41, 59, 0.5)',
                color: selectedExecutorId === e.id ? 'white' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: selectedExecutorId === e.id ? 600 : 400,
              }}
            >
              {e.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(251, 191, 36, 0.2)',
            color: '#fbbf24',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          导出Excel
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
        {selectedExecutorName}项目控制表
      </h2>

      {/* 表格 */}
      <div style={{ ...cardStyle, maxHeight: '70vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1600px' }}>
          <thead>
            {/* 分组标题行 */}
            <tr>
              <th style={{ ...thGroupStyle, width: '40px' }} rowSpan={2}>序号</th>
              <th style={thGroupStyle} colSpan={6}>项目信息</th>
              <th style={{ ...thGroupStyle, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }} colSpan={8}>合同信息</th>
              <th style={{ ...thGroupStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} colSpan={7}>差旅成本</th>
            </tr>
            {/* 字段标题行 */}
            <tr>
              {/* 项目信息 */}
              <th style={{ ...thStyle, minWidth: '120px' }}>项目简称</th>
              <th style={{ ...thStyle, minWidth: '120px' }}>委托方(全称)</th>
              <th style={{ ...thStyle, width: '90px' }}>完成时间</th>
              <th style={{ ...thStyle, width: '80px' }}>联系人</th>
              <th style={{ ...thStyle, width: '100px' }}>项目类型</th>
              <th style={{ ...thStyle, width: '70px' }}>状态</th>
              {/* 合同信息 */}
              <th style={{ ...thStyle, width: '50px' }}>合同发</th>
              <th style={{ ...thStyle, width: '50px' }}>盖章收</th>
              <th style={{ ...thStyle, width: '70px' }}>报告状态</th>
              <th style={{ ...thStyle, width: '50px' }}>开票</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>合同金额</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>回款金额</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'right' }}>坏账</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>欠款金额</th>
              {/* 差旅成本 */}
              <th style={{ ...thStyle, width: '70px', textAlign: 'right' }}>交通费</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right' }}>住宿</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right' }}>餐饮</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right' }}>其他</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'right' }}>合计</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right' }}>占收入%</th>
              <th style={{ ...thStyle, minWidth: '100px' }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {executorProjects.map((p, idx) => {
              const control = getControlEntry(p.id);
              const receipt = getProjectReceipt(p.id);
              const expense = getProjectExpenseBreakdown(p.projectShortName);
              const debt = p.contractAmount - receipt.confirmedReceipt - control.badDebt;
              const expenseRate = p.contractAmount > 0 ? (expense.total / p.contractAmount * 100).toFixed(1) : '-';

              return (
                <tr key={p.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  {/* 项目信息 - 从Project表映射 */}
                  <td style={{ ...tdStyle, color: '#f8fafc' }}>{p.projectShortName}</td>
                  <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.payer}</td>
                  <td style={{ ...tdStyle, color: '#94a3b8' }}>{p.completionDate || '-'}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={control.clientContact} onChange={e => handleUpdate(p.id, 'clientContact', e.target.value)} placeholder="联系人" />
                  </td>
                  <td style={tdStyle}>
                    <select style={selectStyle} value={control.projectType} onChange={e => handleUpdate(p.id, 'projectType', e.target.value as ProjectType)}>
                      {PROJECT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: p.status === 4 ? '#06d6a0' : p.status >= 2 ? '#fbbf24' : '#94a3b8' }}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </td>
                  {/* 合同信息 */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.contractSent} onChange={e => handleUpdate(p.id, 'contractSent', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.contractReceived} onChange={e => handleUpdate(p.id, 'contractReceived', e.target.checked)} />
                  </td>
                  <td style={tdStyle}>
                    <select style={selectStyle} value={control.reportStatus} onChange={e => handleUpdate(p.id, 'reportStatus', e.target.value as ReportStatus)}>
                      {REPORT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={receipt.hasInvoice} disabled />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#f8fafc' }}>{p.contractAmount.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{receipt.confirmedReceipt.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <input type="number" style={{ ...inputStyle, textAlign: 'right' }} value={control.badDebt} onChange={e => handleUpdate(p.id, 'badDebt', Number(e.target.value))} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: debt > 0 ? '#f87171' : '#06d6a0' }}>{debt.toLocaleString()}</td>
                  {/* 差旅成本 - 从Expense表映射 */}
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{expense.transport.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{expense.accommodation.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{expense.meals.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{expense.other.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24', fontWeight: 500 }}>{expense.total.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: Number(expenseRate) > 10 ? '#f87171' : '#94a3b8' }}>{expenseRate}%</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={control.remark} onChange={e => handleUpdate(p.id, 'remark', e.target.value)} placeholder="备注" />
                  </td>
                </tr>
              );
            })}
            {/* 汇总行 */}
            <tr style={{ background: 'rgba(6, 214, 160, 0.1)', fontWeight: 600 }}>
              <td style={{ ...tdStyle, textAlign: 'center', color: '#06d6a0' }}>合计</td>
              <td style={{ ...tdStyle, color: '#06d6a0' }} colSpan={6}>共 {totals.projectCount} 个项目</td>
              <td colSpan={4} style={tdStyle}></td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.contractAmount.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.confirmedReceipt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#f87171' }}>{totals.badDebt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: totals.debt > 0 ? '#f87171' : '#06d6a0' }}>{totals.debt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{totals.transport.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{totals.accommodation.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{totals.meals.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{totals.other.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24' }}>{totals.expenseTotal.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>
                {totals.contractAmount > 0 ? (totals.expenseTotal / totals.contractAmount * 100).toFixed(1) : '-'}%
              </td>
              <td style={tdStyle}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
