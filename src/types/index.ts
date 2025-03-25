export interface Employee {
  employee_id: string;
  name: string;
  role: string;
  attendance_percentage: number;
  department: string;
}

export type Category = 'All' | 'Management' | 'Production' | 'Quality' | 'Maintenance';