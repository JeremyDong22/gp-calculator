// v3.1 - 人员安排表模块
// 更新：使用projectShortName、支持多项目安排、assignments数组结构
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
  overflowX: 'auto',
};

// 项目颜色映射
const projectColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f43f5e', '#84cc16', '#14b8a6', '#6366f1', '#a855f7', '#d946ef',
];

export function StaffAssignmentPanel() {
  const { users, projects, assignments, addAssignment, deleteAssignment } = useData();
  const [weekOffset, setWeekOffset] = useState(0);

  // 按级别排序用户
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.level - b.level);
  }, [users]);

  // 生成当前周的日期
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [weekOffset]);

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  const getProjectColor = (projectId: string) => {
    const idx = projects.findIndex(p => p.id === projectId);
    return projectColors[idx % projectColors.length] || '#64748b';
  };

  const getAssignment = (userId: string, date: string) => {
    return assignments.find(a => a.userId === userId && a.date === date);
  };

  const getProjectName = (projectId: string, customName?: string) => {
    if (projectId === 'custom' && customName) return customName;
    if (!projectId) return '';
    return projects.find(p => p.id === projectId)?.projectShortName || '-';
  };

  const handleCellClick = (userId: string, date: string) => {
    const existing = getAssignment(userId, date);
    if (existing) {
      deleteAssignment(existing.id);
    } else {
      const projectId = projects[0]?.id || '';
      addAssignment({
        userId,
        date,
        assignments: [{ projectId, location: '北京' }],
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>📅 人员安排表</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer'
          }}>← 上周</button>
          <button onClick={() => setWeekOffset(0)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #118ab2)', color: 'white', cursor: 'pointer'
          }}>本周</button>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer'
          }}>下周 →</button>
        </div>
      </div>

      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', width: '100px', position: 'sticky', left: 0, background: 'rgba(30, 41, 59, 0.9)' }}>姓名</th>
              {weekDates.map((date, i) => (
                <th key={date} style={{
                  padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem',
                  color: i >= 5 ? '#fbbf24' : '#94a3b8',
                  background: i >= 5 ? 'rgba(251, 191, 36, 0.1)' : 'transparent'
                }}>
                  <div>{dayNames[i]}</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                <td style={{
                  padding: '0.5rem 0.75rem', color: '#f8fafc', fontSize: '0.875rem',
                  position: 'sticky', left: 0, background: 'rgba(30, 41, 59, 0.9)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{user.name}</span>
                    <span style={{ fontSize: '0.625rem', color: '#64748b' }}>L{user.level}</span>
                  </div>
                </td>
                {weekDates.map((date, i) => {
                  const assignment = getAssignment(user.id, date);
                  // 支持多项目显示
                  const assignmentList = assignment?.assignments || [];

                  return (
                    <td
                      key={date}
                      onClick={() => handleCellClick(user.id, date)}
                      style={{
                        padding: '0.25rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: i >= 5 ? 'rgba(251, 191, 36, 0.05)' : 'transparent',
                      }}
                    >
                      {assignmentList.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          {assignmentList.map((a, idx) => {
                            const bgColor = a.projectId === 'custom' ? '#64748b' : getProjectColor(a.projectId);
                            return (
                              <div key={idx} style={{
                                background: bgColor,
                                color: 'white',
                                padding: '0.375rem 0.25rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                lineHeight: 1.3,
                              }}>
                                <div style={{ fontWeight: 500 }}>{getProjectName(a.projectId, a.customProjectName)}</div>
                                <div style={{ opacity: 0.8 }}>({a.location})</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 图例 */}
      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginRight: '0.5rem' }}>项目图例:</span>
        {projects.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: projectColors[i % projectColors.length] }} />
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{p.projectShortName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
