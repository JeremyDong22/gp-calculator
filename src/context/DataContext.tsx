// v1.1 - Data context for timesheets and expenses state management
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TimesheetEntry, ExpenseEntry } from '../types';
import { initialTimesheets, initialExpenses } from '../data/mockData';

interface DataContextType {
  timesheets: TimesheetEntry[];
  expenses: ExpenseEntry[];
  addTimesheet: (entry: Omit<TimesheetEntry, 'id' | 'status'>) => void;
  addExpense: (entry: Omit<ExpenseEntry, 'id' | 'status'>) => void;
  updateTimesheetStatus: (id: string, status: 'approved' | 'rejected') => void;
  updateExpenseStatus: (id: string, status: 'approved' | 'rejected') => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(initialTimesheets);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);

  const addTimesheet = (entry: Omit<TimesheetEntry, 'id' | 'status'>) => {
    const newEntry: TimesheetEntry = {
      ...entry,
      id: `t${Date.now()}`,
      status: 'pending',
    };
    setTimesheets(prev => [...prev, newEntry]);
  };

  const addExpense = (entry: Omit<ExpenseEntry, 'id' | 'status'>) => {
    const newEntry: ExpenseEntry = {
      ...entry,
      id: `e${Date.now()}`,
      status: 'pending',
    };
    setExpenses(prev => [...prev, newEntry]);
  };

  const updateTimesheetStatus = (id: string, status: 'approved' | 'rejected') => {
    setTimesheets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateExpenseStatus = (id: string, status: 'approved' | 'rejected') => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  return (
    <DataContext.Provider value={{ timesheets, expenses, addTimesheet, addExpense, updateTimesheetStatus, updateExpenseStatus }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
