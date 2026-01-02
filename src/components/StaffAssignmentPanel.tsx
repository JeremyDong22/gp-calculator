// v4.0 - 人员安排表模块
// 更新：添加项目选择下拉框、使用执行负责人颜色、权限控制、执行负责人图例、固定表头
import { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';

const cardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '1.5rem',
  marginBottom: '1rem',
  overflowX: 'auto',
};

const defaultExecutorColors: Record<string, string> = {
  '刘宽': '#3b82f6',
  '郭瑞刚': '#22c55e',
  '李胜男': '#f9a8d4',
  '傅曲博': '#94a3b8',
};

export function StaffAssignmentPanel() {
  const { users, projects, assignments, addAssignment, updateAssignment, deleteAssignment, executorColors } = useData();
  const { isDepartmentHead, isProjectManager } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingCell, setEditingCell] = useState<{ userId: string; date: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canEdit = isDepartmentHead || isProjectManager;

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.level - b.level);
  }, [users]);

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

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [projects]);

  const getExecutorColor = (executorId: string) => {
    const config = executorColors.find(c => c.executorId === executorId);
    if (config) return config.color;
    const executor = users.find(u => u.id === executorId);
    return executor ? defaultExecutorColors[executor.name] || '#64748b' : '#64748b';
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
    if (!canEdit) return;
    setEditingCell({ userId, date });
  };

  const handleAddAssignment = (projectId: string, location: string, customName?: string) => {
    if (!editingCell) return;
    const existing = getAssignment(editingCell.userId, editingCell.date);
    if (existing) {
      updateAssignment(existing.id, {
        assignments: [...existing.assignments, { projectId, location, customProjectName: customName }]
      });
    } else {
      addAssignment({
        userId: editingCell.userId,
        date: editingCell.date,
        assignments: [{ projectId, location, customProjectName: customName }],
      });
    }
    setEditingCell(null);
  };

  const handleDeleteAssignment = (userId: string, date: string, index: number) => {
    if (!canEdit) return;
    const existing = getAssignment(userId, date);
    if (!existing) return;
    if (existing.assignments.length === 1) {
      deleteAssignment(existing.id);
    } else {
      updateAssignment(existing.id, {
        assignments: existing.assignments.filter((_, i) => i !== index)
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditingCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executorList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    projects.forEach(p => {
      if (!map.has(p.executionLeaderId)) {
        const executor = users.find(u => u.id === p.executionLeaderId);
        const name = executor?.name || p.executionLeaderName || '未知';
        map.set(p.executionLeaderId, { id: p.executionLeaderId, name, color: getExecutorColor(p.executionLeaderId) });
      }
    });
    return Array.from(map.values());
  }, [projects, users, executorColors]);

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
            <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(30, 41, 59, 0.95)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', width: '100px', position: 'sticky', left: 0, background: 'rgba(30, 41, 59, 0.95)' }}>姓名</th>
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
                  const assignmentList = assignment?.assignments || [];
                  const isEditing = editingCell?.userId === user.id && editingCell?.date === date;

                  return (
                    <td
                      key={date}
                      onClick={() => handleCellClick(user.id, date)}
                      style={{
                        padding: '0.25rem',
                        textAlign: 'center',
                        cursor: canEdit ? 'pointer' : 'default',
                        background: i >= 5 ? 'rgba(251, 191, 36, 0.05)' : 'transparent',
                        position: 'relative',
                      }}
                    >
                      {assignmentList.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          {assignmentList.map((a, idx) => {
                            const project = projects.find(p => p.id === a.projectId);
                            const bgColor = project ? getExecutorColor(project.executionLeaderId) : '#64748b';
                            return (
                              <div key={idx} style={{
                                background: bgColor,
                                color: 'white',
                                padding: '0.375rem 0.25rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                lineHeight: 1.3,
                                position: 'relative',
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAssignment(user.id, date, idx);
                              }}
                              >
                                <div style={{ fontWeight: 500 }}>{getProjectName(a.projectId, a.customProjectName)}</div>
                                <div style={{ opacity: 0.8 }}>({a.location})</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {isEditing && (
                        <div ref={dropdownRef} style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 100,
                          background: '#1e293b',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          minWidth: '200px',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        }}>
                          <ProjectDropdown
                            projects={sortedProjects}
                            onSelect={handleAddAssignment}
                          />
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

      <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginRight: '0.5rem' }}>执行负责人图例:</span>
        {executorList.map((executor) => (
          <div key={executor.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: executor.color }} />
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{executor.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDropdown({ projects, onSelect }: {
  projects: Project[];
  onSelect: (projectId: string, location: string, customName?: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [location, setLocation] = useState('北京');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {!showCustom ? (
        <>
          <button
            onClick={() => setShowCustom(true)}
            style={{
              padding: '0.5rem',
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.75rem',
            }}
          >
            自定义
          </button>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id, location)}
              style={{
                padding: '0.5rem',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.75rem',
              }}
            >
              {p.projectShortName}
            </button>
          ))}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="地点"
            style={{
              padding: '0.5rem',
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '4px',
              fontSize: '0.75rem',
            }}
          />
        </>
      ) : (
        <>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="自定义项目名称"
            autoFocus
            style={{
              padding: '0.5rem',
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '4px',
              fontSize: '0.75rem',
            }}
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="地点"
            style={{
              padding: '0.5rem',
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '4px',
              fontSize: '0.75rem',
            }}
          />
          <button
            onClick={() => {
              if (customName.trim()) {
                onSelect('custom', location, customName);
              }
            }}
            style={{
              padding: '0.5rem',
              background: '#06d6a0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            确认
          </button>
          <button
            onClick={() => setShowCustom(false)}
            style={{
              padding: '0.5rem',
              background: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            返回
          </button>
        </>
      )}
    </div>
  );
}
