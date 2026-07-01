import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from './axiosInstance';

const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers, responseType }: { url: string; method: string; data?: any; params?: any; headers?: any; responseType?: any }) => {
    try {
      // 🛠️ Special handling for FormData: let axios set the Content-Type with boundary
      const configHeaders = { ...headers };
      
      // Default empty object for POST/PUT/PATCH if no data is provided to ensure Content-Type is set
      let requestData = data;
      if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase()) && data === undefined) {
        requestData = {};
      }

      if (requestData instanceof FormData) {
        // 🛡️ IMPORTANT: Remove Content-Type to let axios set it with the correct boundary
        delete configHeaders['Content-Type'];
      } else if (requestData && typeof requestData === 'object' && !configHeaders['Content-Type']) {
        // Default to JSON for objects if no content type is specified
        configHeaders['Content-Type'] = 'application/json';
      }

      const result = await axiosInstance({ 
        url: baseUrl + url, 
        method, 
        data: requestData, 
        params, 
        headers: configHeaders,
        responseType
      });
      return { data: result.data };
    } catch (axiosError: any) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Users', 'Projects', 'Tasks', 'Attendance', 'Leaves', 'MyLeaves', 'LeaveBalances',
    'TimeEntries', 'Shifts', 'ShiftAssignments', 'UserShift',
    'Calendar', 'Notifications', 
    'AuditLogs', 'Dashboard', 'Roles', 'Departments', 
    'Designations', 'LeaveTypes', 'Meetings', 'Events', 'Holidays', 'Sessions', 'TodayAttendance',
    'ActiveTimer', 'TimeEntries', 'TeamLiveStatus', 'Profile',
    'AttendanceReport', 'TimeTrackingReport', 'ProjectHealthReport', 'LeaveReport', 'ProductivityReport',
    'Settings', 'Holidays', 'Expenses', 'Payroll', 'SalaryStructure', 'FileHub', 'Clients', 'Tickets',
    'Merchants', 'Deboarding', 'Terminals', 'SignupQueue', 'Webhooks', 'Tokens'
  ],
  endpoints: () => ({}),
});
