import { apiFetch } from './api'

export type NotificationItem = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  created_at: string
  read_at: string | null
  metadata: Record<string, unknown> | null
}

export async function getMyNotifications(): Promise<{ notifications: NotificationItem[] }> {
  return apiFetch('/api/notifications')
}

export async function markNotificationRead(notificationId: string): Promise<{ notification: NotificationItem | null }> {
  return apiFetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true }),
  })
}


