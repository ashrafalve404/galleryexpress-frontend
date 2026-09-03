import client from './client';

export interface AdminNotification {
  id: string;
  type: string;
  category: 'USER_PAYMENT' | 'AGENT_BULK' | 'MESSAGE' | 'SYSTEM';
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
  meta?: any;
}

export interface AdminNotificationsResponse {
  success: boolean;
  unreadCount: number;
  notifications: AdminNotification[];
}

export async function getAdminNotifications(): Promise<AdminNotificationsResponse> {
  const { data } = await client.get('/api/v1/admin/notifications');
  return data;
}
