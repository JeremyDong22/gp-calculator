# GP Calculator - 咨询部项目管理系统

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Deployment

After pushing to GitHub, manually deploy to Cloudflare Pages:

```bash
npm run build && wrangler pages deploy dist --project-name=gp-calculator --commit-dirty=true
```

GitHub auto-deploy is not configured. Always use wrangler to deploy after git push.

## Version

Update `APP_VERSION` in `src/App.tsx` when making releases. Format: `vX.X-YYYYMMDD`

## Architecture

```
src/
├── App.tsx                 # Main app, routing, header, navigation
├── context/
│   ├── AuthContext.tsx     # Authentication, roles, permissions
│   └── DataContext.tsx     # CRUD operations, localStorage persistence
├── components/
│   ├── LoginPage.tsx       # Production login
│   ├── QuickLogin.tsx      # Test mode quick login
│   ├── ProjectSetupPanel.tsx      # 项目建项
│   ├── StaffSetupPanel.tsx        # 人员建项
│   ├── StaffAssignmentPanel.tsx   # 人员安排
│   ├── TimesheetPanel.tsx         # 工时填报
│   ├── ExpensePanel.tsx           # 差旅报销
│   ├── TimesheetSummaryPanel.tsx  # 工时汇总
│   ├── ProjectControlPanel.tsx    # 项目控制表
│   ├── GrossProfitDashboard.tsx   # 项目毛利分析
│   ├── BonusCalculationPanel.tsx  # 奖金计算表
│   ├── CashReceiptPanel.tsx       # 现金收款表
│   └── ExecutorColorConfigPanel.tsx # 颜色配置
└── types/index.ts          # All TypeScript types
```

## Roles & Permissions

| Role | 项目建项 | 人员建项 | 人员安排 | 工时填报 | 差旅报销 | 工时汇总 | 项目控制表 | 毛利分析 | 奖金计算 | 现金收款 |
|------|---------|---------|---------|---------|---------|---------|-----------|---------|---------|---------|
| department_head | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| project_manager | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - |
| secretary | - | - | - | ✓ | ✓ | - | - | - | - | - |
| employee | - | - | - | ✓ | ✓ | - | - | - | - | - |
| intern | - | - | - | ✓ | ✓ | - | - | - | - | - |

## Data Flow

- **AuthContext**: `currentUser`, `login/logout`, role checks (`isDepartmentHead`, `isProjectManager`, etc.)
- **DataContext**: All entities stored in localStorage with prefix `gp_calculator_`
  - `users`, `projects`, `timesheets`, `expenses`, `assignments`, `cashReceipts`, `executorColors`, `projectControls`

## Tech Stack

- React 18 + TypeScript + Vite
- @dnd-kit for drag-and-drop (staff ordering)
- Cloudflare Pages hosting
- LocalStorage for data persistence
