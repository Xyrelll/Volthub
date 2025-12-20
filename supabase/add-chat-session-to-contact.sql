-- Add chat_session_id to contact_submissions table
-- This links contact form submissions to chat sessions

-- Add the column
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS chat_session_id TEXT;

-- Add foreign key constraint (optional - allows NULL since not all submissions come from chat)
-- ALTER TABLE contact_submissions
-- ADD CONSTRAINT fk_contact_chat_session 
-- FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(session_id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_chat_session_id 
ON contact_submissions(chat_session_id);

-- Add comment to document the column
COMMENT ON COLUMN contact_submissions.chat_session_id IS 'Links contact submission to chat session if user came from chat widget';

-- Add name columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add name columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create indexes for name searches
CREATE INDEX IF NOT EXISTS idx_chat_sessions_name ON chat_sessions(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_chat_messages_name ON chat_messages(first_name, last_name);

-- Add comments
COMMENT ON COLUMN chat_sessions.first_name IS 'User first name if provided via contact form';
COMMENT ON COLUMN chat_sessions.last_name IS 'User last name if provided via contact form';
COMMENT ON COLUMN chat_messages.first_name IS 'User first name if available when message was sent';
COMMENT ON COLUMN chat_messages.last_name IS 'User last name if available when message was sent';

