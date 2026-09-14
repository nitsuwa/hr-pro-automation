export const DEMO_ACCOUNTS = {
  systemAdmin: {
    name: 'System Admin',
    label: 'System Admin (admin@filmetrics.local)',
  },

  admin: {
    name: 'Admin',
    label: 'Admin (companyadmin@filmetrics.local)',
  },

  payrollManager: {
    name: 'Payroll Manager',
    label: 'Payroll Manager (payrollmanager@filmetrics.local)',
  },

  hrOfficer: {
    name: 'HR Officer',
    label: 'HR Officer (hrofficer@filmetrics.local)',
  },

  supervisor: {
    name: 'Supervisor / Manager',
    label: 'Supervisor / Manager (supervisor@filmetrics.local)',
  },

  employee: {
    name: 'Employee',
    label: 'Employee (employee@filmetrics.local)',
  },
} as const;

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS;