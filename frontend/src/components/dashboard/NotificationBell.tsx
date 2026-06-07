import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getMyNotifications, markNotificationRead, type NotificationItem } from '../../lib/notifications'

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([])

  const [open, setOpen] = useState(false)

  const unreadCount = useMemo(() => items.filter((x) => !x.read_at).length, [items])

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await getMyNotifications()
        if (alive) setItems(res.notifications)
      } catch {
        // ignore
      }
    }

    load()

    const channel = supabase
      .channel('notifications-inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const row = (payload as unknown as { new?: NotificationItem }).new

          if (!row) return


          // Realtime is not filtered by user_id; filter client-side.
          // Only show notifications for the current user.
          // Filter by current user.
          // Use getSession() to avoid timing issues with realtime callbacks.
          supabase.auth.getSession().then((s) => {
            const uid = s.data.session?.user?.id
            if (!uid) return
            if (row.user_id !== uid) return
            setItems((prev) => {
              // simple dedupe by id
              if (prev.some((x) => x.id === row.id)) return prev
              return [row, ...prev].slice(0, 20)
            })
          })


        }
      )
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function onMarkRead(id: string) {
    // optimistic
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read_at: x.read_at ?? new Date().toISOString() } : x)))
    try {
      await markNotificationRead(id)
    } catch {
      // ignore
    }
  }

  return (
    <div className="maadin-notif-wrap" style={{ position: 'relative' }}>
      <button
        type="button"
        className="maadin-notif-bell"
        aria-label="Notifications"
        onClick={() => setOpen((s) => !s)}
      >
        🔔

        {unreadCount > 0 ? <span className="maadin-notif-count">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="maadin-notif-panel">
          <div className="maadin-notif-panel-title">Notifications</div>
          {items.length === 0 ? (
            <div className="maadin-notif-empty">No notifications</div>
          ) : (
            <div className="maadin-notif-list">
              {items.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  className={`maadin-notif-item ${n.read_at ? 'read' : 'unread'}`}
                  onClick={() => onMarkRead(n.id)}
                >
                  <div className="maadin-notif-item-title">{n.title || n.type}</div>
                  <div className="maadin-notif-item-body">{n.body}</div>
                  <div className="maadin-notif-item-meta">{new Date(n.created_at).toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

