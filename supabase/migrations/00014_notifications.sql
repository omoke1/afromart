-- Notifications for both admins (order alerts, low stock) and users (order updates).
-- scope: 'admin' => visible to all admins (user_id is null)
--        'user'  => visible only to the target user (user_id is set)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('admin', 'user')),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(scope, created_at DESC) WHERE scope = 'admin';
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC) WHERE scope = 'user';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin notifications" ON notifications
  FOR SELECT USING (
    scope = 'admin'
    AND EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
  );

CREATE POLICY "Admins can mark admin notifications read" ON notifications
  FOR UPDATE USING (
    scope = 'admin'
    AND EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
  ) WITH CHECK (
    scope = 'admin'
    AND EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
  );

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (scope = 'user' AND user_id = auth.uid());

CREATE POLICY "Users can mark own notifications read" ON notifications
  FOR UPDATE USING (scope = 'user' AND user_id = auth.uid())
  WITH CHECK (scope = 'user' AND user_id = auth.uid());
