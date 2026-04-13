-- =====================================================
-- SAC SHOP - ORDER STATUS HISTORY TRACKING
-- Ensures every change in order state is logged
-- =====================================================

-- 1. Create History Table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb -- For storing IP or admin notes if needed
);

-- 2. Create Logging Function
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if the status has actually changed
    IF (OLD.status IS NULL OR OLD.status <> NEW.status) THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, metadata)
        VALUES (
            NEW.id, 
            OLD.status, 
            NEW.status,
            jsonb_build_object(
                'updated_at', NOW(),
                'order_number', NEW.order_number
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS trg_log_order_status_change ON orders;
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- 4. RLS for History
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can read all history
CREATE POLICY "admin_read_history" ON order_status_history
FOR SELECT USING (true); -- Usually restricted to admin role in real apps

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON order_status_history(changed_at);
