export type UserStatus = 'Active' | 'Inactive' | 'Locked';
export type ProjectStatus = 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
export type TaskStatus = 'Todo' | 'InProgress' | 'Review' | 'Hold' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'Holiday' | 'WeekOff' | 'OnLeave';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type TimeEntryStatus = 'CheckedIn' | 'Working' | 'LunchBreak' | 'TeaBreak' | 'Meeting' | 'NormalBreak' | 'CheckedOut';

export interface User {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  profilePicture?: string;
  status: UserStatus;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  joiningDate: string;
  isEmailVerified: boolean;
  isPasswordChanged: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ... other interfaces will be added as needed in Flow 02+
