import { DatabaseOperations } from '../../src/database/operations.js';
import { SupabaseConnection } from '../../src/database/client.js';
import { DatabaseError, DatabaseErrorType } from '../../src/types/database.js';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('DatabaseOperations', () => {
  let dbOps: DatabaseOperations;
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Initialize database operations
    dbOps = new DatabaseOperations();
  });

  describe('createEmail', () => {
    const mockEmail = {
      sender: 'test@example.com',
      subject: 'Test Email',
      date: new Date(),
      body_text: 'Test body',
      body_html: '<p>Test body</p>',
      attachment_info: null,
      processed: false,
    };

    it('should create an email record successfully', async () => {
      const expectedResponse = { ...mockEmail, id: '123', created_at: new Date() };
      mockSupabaseClient.single.mockResolvedValue({ data: expectedResponse, error: null });

      const result = await dbOps.createEmail(mockEmail);
      expect(result).toEqual(expectedResponse);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('emails');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([mockEmail]);
    });

    it('should throw DatabaseError when creation fails', async () => {
      const error = new Error('Database error');
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });

      await expect(dbOps.createEmail(mockEmail)).rejects.toThrow(DatabaseError);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('emails');
    });
  });

  describe('createLink', () => {
    const mockLink = {
      url: 'https://example.com',
      anchor_text: 'Example',
      surrounding_context: 'Test context',
      categories: ['test'],
      email_id: '123',
    };

    it('should create a link record successfully', async () => {
      const expectedResponse = { ...mockLink, id: '456', created_at: new Date() };
      mockSupabaseClient.single.mockResolvedValue({ data: expectedResponse, error: null });

      const result = await dbOps.createLink(mockLink);
      expect(result).toEqual(expectedResponse);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([mockLink]);
    });

    it('should throw DatabaseError when creation fails', async () => {
      const error = new Error('Database error');
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });

      await expect(dbOps.createLink(mockLink)).rejects.toThrow(DatabaseError);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links');
    });
  });

  describe('queryEmails', () => {
    it('should query emails with filters', async () => {
      const mockEmails = [
        { id: '1', sender: 'test@example.com', subject: 'Test 1' },
        { id: '2', sender: 'test@example.com', subject: 'Test 2' },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockEmails, error: null });

      const filter = {
        sender: 'test@example.com',
        subject: 'Test',
        dateFrom: new Date(),
        dateTo: new Date(),
        processed: true,
        limit: 10,
        offset: 0,
      };

      const result = await dbOps.queryEmails(filter);
      expect(result).toEqual(mockEmails);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('emails');
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('sender', '%test@example.com%');
    });

    it('should handle empty results', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: null, error: null });

      const result = await dbOps.queryEmails({});
      expect(result).toEqual([]);
    });
  });

  describe('queryLinks', () => {
    it('should query links with filters', async () => {
      const mockLinks = [
        { id: '1', url: 'https://example.com/1' },
        { id: '2', url: 'https://example.com/2' },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockLinks, error: null });

      const filter = {
        url: 'example.com',
        categories: ['test'],
        emailId: '123',
        limit: 10,
        offset: 0,
      };

      const result = await dbOps.queryLinks(filter);
      expect(result).toEqual(mockLinks);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links');
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('url', '%example.com%');
    });

    it('should handle empty results', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: null, error: null });

      const result = await dbOps.queryLinks({});
      expect(result).toEqual([]);
    });
  });

  describe('getEmailById', () => {
    it('should return email by ID', async () => {
      const mockEmail = { id: '123', sender: 'test@example.com' };
      mockSupabaseClient.single.mockResolvedValue({ data: mockEmail, error: null });

      const result = await dbOps.getEmailById('123');
      expect(result).toEqual(mockEmail);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('emails');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should return null when email not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      const result = await dbOps.getEmailById('123');
      expect(result).toBeNull();
    });
  });

  describe('getLinksByEmailId', () => {
    it('should return links by email ID', async () => {
      const mockLinks = [
        { id: '1', email_id: '123' },
        { id: '2', email_id: '123' },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockLinks, error: null });

      const result = await dbOps.getLinksByEmailId('123');
      expect(result).toEqual(mockLinks);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('email_id', '123');
    });

    it('should handle empty results', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: null, error: null });

      const result = await dbOps.getLinksByEmailId('123');
      expect(result).toEqual([]);
    });
  });
}); 