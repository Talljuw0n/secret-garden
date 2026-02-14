-- Divine Encounter 2026 Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary table

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    attendance_mode VARCHAR(20) NOT NULL CHECK (attendance_mode IN ('in-person', 'virtual')),
    church VARCHAR(255),
    special_needs TEXT,
    newsletter BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- Create index on transaction reference for payment verification
CREATE INDEX IF NOT EXISTS idx_registrations_transaction_ref ON registrations(transaction_reference);

-- Create index on payment status for filtering
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Adjust these policies based on your security requirements
CREATE POLICY "Allow all operations for service role"
    ON registrations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Optional: Create a view for statistics
CREATE OR REPLACE VIEW registration_stats AS
SELECT
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_registrations,
    COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_registrations,
    COUNT(*) FILTER (WHERE attendance_mode = 'in-person' AND payment_status = 'paid') as in_person_attendees,
    COUNT(*) FILTER (WHERE attendance_mode = 'virtual' AND payment_status = 'paid') as virtual_attendees,
    SUM(payment_amount) FILTER (WHERE payment_status = 'paid') as total_revenue,
    DATE(MAX(created_at)) as last_registration_date
FROM registrations;

-- Grant access to the view
GRANT SELECT ON registration_stats TO service_role;

-- Comments for documentation
COMMENT ON TABLE registrations IS 'Stores all event registration information';
COMMENT ON COLUMN registrations.full_name IS 'Full name of the registrant';
COMMENT ON COLUMN registrations.email IS 'Email address for confirmation and communication';
COMMENT ON COLUMN registrations.phone IS 'Contact phone number';
COMMENT ON COLUMN registrations.attendance_mode IS 'Whether attending in-person or virtually';
COMMENT ON COLUMN registrations.payment_status IS 'Current status of payment: pending, paid, failed, or refunded';
COMMENT ON COLUMN registrations.transaction_reference IS 'Unique reference for payment tracking';