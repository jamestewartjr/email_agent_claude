import { config } from 'dotenv';
import { DatabaseOperations } from '../database/operations.js';

// Load environment variables
config();

async function testConnection() {
  try {
    const db = new DatabaseOperations();
    
    // Try to query emails (this will test the connection)
    const emails = await db.queryEmails({ limit: 1 });
    console.log('Successfully connected to Supabase!');
    console.log('Found', emails.length, 'emails');
    
    // Test creating an email
    const testEmail = await db.createEmail({
      sender: 'test@example.com',
      subject: 'Test Connection',
      date: new Date(),
      body_text: 'This is a test email',
      body_html: '<p>This is a test email</p>',
      attachment_info: null,
      processed: false,
    });
    console.log('Successfully created test email:', testEmail.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    process.exit(1);
  }
}

testConnection(); 