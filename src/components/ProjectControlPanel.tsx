// v3.2 - 项目控制表组件
// 功能：类Excel大表格，单元格直接编辑，数据推送，导出Excel
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { ProjectControlEntry } from '../types';

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

const tdStyle: React.CSSProperties = {
  padding: '0.25rem',
  fontSize: '0.75rem',
  borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
  verticalAlign: 'middle',
};

// 复选框样式
const checkboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
  accentColor: '#06d6a0',
};

export function ProjectControlPanel() {
  const { projects, users, projectControls, expenses, timesheets, cashReceipts, updateProjectControl, getOrCreateProjectControl } = useData();

  // 获取所有执行负责人
  const executors = useMemo(() => {
    const executorIds = [...new Set(projects.map(p => p.executionLeaderId))];
    return executorIds.map(id => {
      const user = users.find(u => u.id === id);
      return { id, name: user?.name || id };
    });
  }, [projects, users]);

  // 当前选中的执行负责人
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>(executors[0]?.id || '');

  // 获取当前执行负责人的项目
  const executorProjects = useMemo(() => {
    return projects.filter(p => p.executionLeaderId === selectedExecutorId);
  }, [projects, selectedExecutorId]);

  // 获取项目的差旅费用合计
  const getProjectTravelExpense = (projectId: string) => {
    return expenses
      .filter(e => e.projectId === projectId && e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 获取项目的工时合计（天）
  const getProjectTotalDays = (projectId: string) => {
    return timesheets
      .filter(t => t.projectId === projectId && t.status === 'approved')
      .reduce((sum, t) => sum + t.totalHours / 8, 0);
  };

  // 获取项目的收款信息
  const getProjectReceipt = (projectId: string) => {
    const receipts = cashReceipts.filter(r => r.projectId === projectId);
    return {
      financeReceipt: receipts.reduce((sum, r) => sum + r.financeReceipt, 0),
      confirmedReceipt: receipts.reduce((sum, r) => sum + r.confirmedReceipt, 0),
      adjustedReceipt: receipts.reduce((sum, r) => sum + r.adjustedReceipt, 0),
    };
  };

  // 获取项目的小组成员（从工时表提取）
  const getProjectTeamMembers = (projectId: string) => {
    const memberIds = [...new Set(timesheets.filter(t => t.projectId === projectId).map(t => t.userId))];
    return memberIds.map(id => users.find(u => u.id === id)?.name || id).join(', ');
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
    const headers = ['序号', '委托方全称', '项目简称', '委托方联系人', '合同金额', '合同已发', '盖章已收', '初稿发出', '终稿发出', '报告发出', '已开票', '财务收款', '确认收款', '调整收款', '坏账', '差旅费', '工时(天)', '小组成员', '备注', '差旅备注'];

    const rows = executorProjects.map((p, idx) => {
      const control = getControlEntry(p.id);
      const receipt = getProjectReceipt(p.id);
      const travelExpense = getProjectTravelExpense(p.id);
      const totalDays = getProjectTotalDays(p.id);
      const teamMembers = control.teamMembers || getProjectTeamMembers(p.id);

      return [
        idx + 1,
        p.clientFullName,
        p.projectShortName,
        control.clientContact,
        p.contractAmount,
        control.contractSent ? 'Y' : 'N',
        control.contractReceived ? 'Y' : 'N',
        control.draftSent ? 'Y' : 'N',
        control.finalSent ? 'Y' : 'N',
        control.reportSent ? 'Y' : 'N',
        control.invoiced ? 'Y' : 'N',
        receipt.financeReceipt,
        receipt.confirmedReceipt,
        receipt.adjustedReceipt,
        control.badDebt,
        travelExpense,
        totalDays.toFixed(1),
        teamMembers,
        control.remark,
        control.travelRemark,
      ];
    });

    // 汇总行
    const totals = executorProjects.reduce((acc, p) => {
      const control = getControlEntry(p.id);
      const receipt = getProjectReceipt(p.id);
      return {
        contractAmount: acc.contractAmount + p.contractAmount,
        financeReceipt: acc.financeReceipt + receipt.financeReceipt,
        confirmedReceipt: acc.confirmedReceipt + receipt.confirmedReceipt,
        adjustedReceipt: acc.adjustedReceipt + receipt.adjustedReceipt,
        badDebt: acc.badDebt + control.badDebt,
        travelExpense: acc.travelExpense + getProjectTravelExpense(p.id),
        totalDays: acc.totalDays + getProjectTotalDays(p.id),
      };
    }, { contractAmount: 0, financeReceipt: 0, confirmedReceipt: 0, adjustedReceipt: 0, badDebt: 0, travelExpense: 0, totalDays: 0 });

    rows.push(['合计', '', '', '', totals.contractAmount, '', '', '', '', '', '', totals.financeReceipt, totals.confirmedReceipt, totals.adjustedReceipt, totals.badDebt, totals.travelExpense, totals.totalDays.toFixed(1), '', '', '']);

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
      return {
        contractAmount: acc.contractAmount + p.contractAmount,
        financeReceipt: acc.financeReceipt + receipt.financeReceipt,
        confirmedReceipt: acc.confirmedReceipt + receipt.confirmedReceipt,
        adjustedReceipt: acc.adjustedReceipt + receipt.adjustedReceipt,
        badDebt: acc.badDebt + control.badDebt,
        travelExpense: acc.travelExpense + getProjectTravelExpense(p.id),
        totalDays: acc.totalDays + getProjectTotalDays(p.id),
        projectCount: acc.projectCount + 1,
      };
    }, { contractAmount: 0, financeReceipt: 0, confirmedReceipt: 0, adjustedReceipt: 0, badDebt: 0, travelExpense: 0, totalDays: 0, projectCount: 0 });
  }, [executorProjects, projectControls, cashReceipts, expenses, timesheets]);

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

      {/* 标题 */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
        {selectedExecutorName}项目控制表
      </h2>

      {/* 表格 */}
      <div style={{ ...cardStyle, maxHeight: '70vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1800px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '40px' }}>序号</th>
              <th style={{ ...thStyle, minWidth: '200px' }}>委托方全称</th>
              <th style={{ ...thStyle, minWidth: '100px' }}>项目简称</th>
              <th style={{ ...thStyle, width: '80px' }}>联系人</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>合同金额</th>
              <th style={{ ...thStyle, width: '50px' }}>合同发</th>
              <th style={{ ...thStyle, width: '50px' }}>盖章收</th>
              <th style={{ ...thStyle, width: '50px' }}>初稿</th>
              <th style={{ ...thStyle, width: '50px' }}>终稿</th>
              <th style={{ ...thStyle, width: '50px' }}>报告</th>
              <th style={{ ...thStyle, width: '50px' }}>开票</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>财务收款</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>确认收款</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>调整收款</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'right' }}>坏账</th>
              <th style={{ ...thStyle, width: '70px', textAlign: 'right' }}>差旅费</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right' }}>工时</th>
              <th style={{ ...thStyle, minWidth: '100px' }}>小组成员</th>
              <th style={{ ...thStyle, minWidth: '100px' }}>备注</th>
              <th style={{ ...thStyle, minWidth: '100px' }}>差旅备注</th>
            </tr>
          </thead>
          <tbody>
            {executorProjects.map((p, idx) => {
              const control = getControlEntry(p.id);
              const receipt = getProjectReceipt(p.id);
              const travelExpense = getProjectTravelExpense(p.id);
              const totalDays = getProjectTotalDays(p.id);
              const autoTeamMembers = getProjectTeamMembers(p.id);

              return (
                <tr key={p.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ ...tdStyle, color: '#f8fafc' }}>{p.clientFullName}</td>
                  <td style={{ ...tdStyle, color: '#06d6a0', fontWeight: 500 }}>{p.projectShortName}</td>
                  <td style={tdStyle}>
                    <input
                      style={inputStyle}
                      value={control.clientContact}
                      onChange={e => handleUpdate(p.id, 'clientContact', e.target.value)}
                      placeholder="联系人"
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#f8fafc' }}>{p.contractAmount.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.contractSent} onChange={e => handleUpdate(p.id, 'contractSent', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.contractReceived} onChange={e => handleUpdate(p.id, 'contractReceived', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.draftSent} onChange={e => handleUpdate(p.id, 'draftSent', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.finalSent} onChange={e => handleUpdate(p.id, 'finalSent', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.reportSent} onChange={e => handleUpdate(p.id, 'reportSent', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input type="checkbox" style={checkboxStyle} checked={control.invoiced} onChange={e => handleUpdate(p.id, 'invoiced', e.target.checked)} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{receipt.financeReceipt.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{receipt.confirmedReceipt.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{receipt.adjustedReceipt.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      style={{ ...inputStyle, textAlign: 'right' }}
                      value={control.badDebt}
                      onChange={e => handleUpdate(p.id, 'badDebt', Number(e.target.value))}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24' }}>{travelExpense.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>{totalDays.toFixed(1)}</td>
                  <td style={tdStyle}>
                    <input
                      style={inputStyle}
                      value={control.teamMembers || autoTeamMembers}
                      onChange={e => handleUpdate(p.id, 'teamMembers', e.target.value)}
                      placeholder="小组成员"
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      style={inputStyle}
                      value={control.remark}
                      onChange={e => handleUpdate(p.id, 'remark', e.target.value)}
                      placeholder="备注"
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      style={inputStyle}
                      value={control.travelRemark}
                      onChange={e => handleUpdate(p.id, 'travelRemark', e.target.value)}
                      placeholder="差旅备注"
                    />
                  </td>
                </tr>
              );
            })}
            {/* 汇总行 */}
            <tr style={{ background: 'rgba(6, 214, 160, 0.1)', fontWeight: 600 }}>
              <td style={{ ...tdStyle, textAlign: 'center', color: '#06d6a0' }}>合计</td>
              <td style={{ ...tdStyle, color: '#06d6a0' }}>共 {totals.projectCount} 个项目</td>
              <td style={tdStyle}></td>
              <td style={tdStyle}></td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.contractAmount.toLocaleString()}</td>
              <td colSpan={6} style={tdStyle}></td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.financeReceipt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.confirmedReceipt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.adjustedReceipt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#f87171' }}>{totals.badDebt.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#fbbf24' }}>{totals.travelExpense.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#06d6a0' }}>{totals.totalDays.toFixed(1)}</td>
              <td colSpan={3} style={tdStyle}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
