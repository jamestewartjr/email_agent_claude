-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    body_text TEXT,
    body_html TEXT,
    attachment_info JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    anchor_text TEXT,
    surrounding_context TEXT,
    categories TEXT[] DEFAULT '{}',
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(processed);
CREATE INDEX IF NOT EXISTS idx_links_email_id ON links(email_id);
CREATE INDEX IF NOT EXISTS idx_links_url ON links(url);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 