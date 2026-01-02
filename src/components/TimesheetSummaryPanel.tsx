// v3.1 - 工时汇总表模块
// 按项目和人员汇总已审核的工时记录，支持导出
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
};

const thStyle: React.CSSProperties = {
  padding: '0.75rem 0.5rem',
  textAlign: 'left',
  color: '#94a3b8',
  fontSize: '0.75rem',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  background: 'rgba(30, 41, 59, 0.95)',
  zIndex: 10,
};

export function TimesheetSummaryPanel() {
  const { isDepartmentHead, isProjectManager } = useAuth();
  const { timesheets, projects, users } = useData();

  // 汇总已审核的工时
  const summaryData = useMemo(() => {
    const approved = timesheets.filter(t => t.status === 'approved');
    const grouped: Record<string, Record<string, number>> = {};

    approved.forEach(t => {
      if (!grouped[t.projectId]) grouped[t.projectId] = {};
      if (!grouped[t.projectId][t.userId]) grouped[t.projectId][t.userId] = 0;
      grouped[t.projectId][t.userId] += t.totalHours;
    });

    const result: { projectId: string; projectShortName: string; userId: string; userName: string; totalHours: number }[] = [];
    Object.entries(grouped).forEach(([projectId, userHours]) => {
      const project = projects.find(p => p.id === projectId);
      Object.entries(userHours).forEach(([userId, hours]) => {
        const user = users.find(u => u.id === userId);
        result.push({
          projectId,
          projectShortName: project?.projectShortName || '-',
          userId,
          userName: user?.name || '-',
          totalHours: hours,
        });
      });
    });

    return result.sort((a, b) => a.projectShortName.localeCompare(b.projectShortName) || a.userName.localeCompare(b.userName));
  }, [timesheets, projects, users]);

  // 按项目汇总
  const projectTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    summaryData.forEach(s => {
      totals[s.projectId] = (totals[s.projectId] || 0) + s.totalHours;
    });
    return totals;
  }, [summaryData]);

  const grandTotal = summaryData.reduce((sum, s) => sum + s.totalHours, 0);

  const exportToExcel = () => {
    const headers = ['项目简称', '姓名', '累计工时'];
    const rows = summaryData.map(s => [s.projectShortName, s.userName, s.totalHours]);
    rows.push(['合计', '', grandTotal]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工时汇总表_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isDepartmentHead && !isProjectManager) {
    return <div style={cardStyle}><p style={{ color: '#94a3b8' }}>仅项目负责人及以上有权限查看工时汇总表</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>📊 工时汇总表</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>按项目和人员汇总已审核工时</p>
        </div>
        <button onClick={exportToExcel} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
        }}>
          📥 导出Excel
        </button>
      </div>

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>📁 项目数</div>
          <div style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 600 }}>{Object.keys(projectTotals).length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>👥 人员数</div>
          <div style={{ color: '#06d6a0', fontSize: '1.25rem', fontWeight: 600 }}>{new Set(summaryData.map(s => s.userId)).size}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>⏱️ 总工时</div>
          <div style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 600 }}>{grandTotal.toLocaleString()}h</div>
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr>
              <th style={thStyle}>项目简称</th>
              <th style={thStyle}>姓名</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>累计工时</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map(s => (
              <tr key={`${s.projectId}-${s.userId}`} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontSize: '0.875rem' }}>{s.projectShortName}</td>
                <td style={{ padding: '0.75rem 0.5rem', color: '#f8fafc', fontSize: '0.875rem' }}>{s.userName}</td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>{s.totalHours}h</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(6, 214, 160, 0.05)' }}>
              <td colSpan={2} style={{ padding: '0.75rem 0.5rem', color: '#06d6a0', fontWeight: 700 }}>📊 合计</td>
              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>{grandTotal.toLocaleString()}h</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
