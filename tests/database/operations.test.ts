/**
 * Database Operations Tests
 *
 * This file contains tests for the database operations module.
 * It mocks the Supabase client and tests the database operations
 * such as creating email records.
 *
 * The tests verify:
 * - Successful creation of email records
 * - Proper error handling when database operations fail
 *
 * Each test sets up mock responses and verifies the correct
 * behavior of the database operations functions.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createDatabaseOperations } from '../../src/database/operations';
import { DatabaseError } from '../../src/types/database';
import { supabaseConnection } from '../../src/database/client';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock the supabaseConnection module
jest.mock('../../src/database/client', () => ({
  supabaseConnection: {
    initialize: jest.fn(),
  },
}));

// Create a partial mock type that includes only the methods we need
type PartialMockSupabaseClient = Pick<SupabaseClient, 'from'> & {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  ilike: jest.Mock;
  gte: jest.Mock;
  lte: jest.Mock;
  contains: jest.Mock;
  limit: jest.Mock;
  range: jest.Mock;
  single: jest.Mock;
  data: unknown;
  error: Error | { code?: string; message?: string } | null;
};

describe('Database Operations', () => {
  let mockClient: PartialMockSupabaseClient;
  let dbOperations: ReturnType<typeof createDatabaseOperations>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock client with chaining methods
    mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: null,
      error: null,
    } as PartialMockSupabaseClient;

    // Mock createClient to return our mock client
    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Mock supabaseConnection.initialize to return our mock client
    (supabaseConnection.initialize as jest.Mock).mockReturnValue(mockClient);

    // Initialize database operations with mock client
    dbOperations = createDatabaseOperations(mockClient as unknown as SupabaseClient);
  });

  describe('createEmail', () => {
    const mockEmail = {
      message_id: 'test-id',
      subject: 'Test Subject',
      sender: 'test@example.com',
      date: new Date(),
      body_text: 'Test content',
      body_html: '<p>Test content</p>',
      attachment_info: null,
      processed: false,
    };

    it('should successfully create an email record', async () => {
      const expectedResponse = { id: '1', created_at: new Date(), ...mockEmail };
      mockClient.data = expectedResponse;
      mockClient.error = null;

      const result = await dbOperations.createEmail(mockEmail);

      expect(mockClient.from).toHaveBeenCalledWith('emails');
      expect(mockClient.insert).toHaveBeenCalledWith([mockEmail]);
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.single).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw DatabaseError on database error', async () => {
      mockClient.data = null;
      mockClient.error = { message: 'Database error' };

      await expect(dbOperations.createEmail(mockEmail)).rejects.toThrow(DatabaseError);
      expect(mockClient.from).toHaveBeenCalledWith('emails');
    });
  });

  describe('createLink', () => {
    const mockLink = {
      url: 'https://example.com',
      anchor_text: 'Example Link',
      surrounding_context: 'Test context',
      categories: ['test'],
      email_id: '1',
    };

    it('should successfully create a link record', async () => {
      const expectedResponse = { id: '1', created_at: new Date(), ...mockLink };
      mockClient.data = expectedResponse;
      mockClient.error = null;

      const result = await dbOperations.createLink(mockLink);

      expect(mockClient.from).toHaveBeenCalledWith('links');
      expect(mockClient.insert).toHaveBeenCalledWith([mockLink]);
      expect(mockClient.select).toHaveBeenCalled();
      expect(mockClient.single).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw DatabaseError on database error', async () => {
      mockClient.data = null;
      mockClient.error = { message: 'Database error' };

      await expect(dbOperations.createLink(mockLink)).rejects.toThrow(DatabaseError);
      expect(mockClient.from).toHaveBeenCalledWith('links');
    });
  });

  describe('queryEmails', () => {
    it('should successfully query emails with all filters', async () => {
      const mockEmails = [
        { id: '1', sender: 'test1@example.com', subject: 'Test 1' },
        { id: '2', sender: 'test2@example.com', subject: 'Test 2' },
      ];

      const filter = {
        sender: 'test',
        subject: 'Test',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31'),
        processed: true,
        limit: 10,
        offset: 0,
      };

      mockClient.data = mockEmails;
      mockClient.error = null;

      const result = await dbOperations.queryEmails(filter);

      expect(mockClient.from).toHaveBeenCalledWith('emails');
      expect(mockClient.ilike).toHaveBeenCalledWith('sender', '%test%');
      expect(mockClient.ilike).toHaveBeenCalledWith('subject', '%Test%');
      expect(mockClient.gte).toHaveBeenCalledWith('date', filter.dateFrom.toISOString());
      expect(mockClient.lte).toHaveBeenCalledWith('date', filter.dateTo.toISOString());
      expect(mockClient.eq).toHaveBeenCalledWith('processed', true);
      expect(mockClient.limit).toHaveBeenCalledWith(10);
      expect(mockClient.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockEmails);
    });

    it('should return empty array when no results found', async () => {
      mockClient.data = null;
      mockClient.error = null;

      const result = await dbOperations.queryEmails({});

      expect(mockClient.from).toHaveBeenCalledWith('emails');
      expect(result).toEqual([]);
    });

    it('should throw DatabaseError on query error', async () => {
      mockClient.data = null;
      mockClient.error = { message: 'Query error' };

      await expect(dbOperations.queryEmails({})).rejects.toThrow(DatabaseError);
    });
  });

  describe('queryLinks', () => {
    it('should successfully query links with all filters', async () => {
      const mockLinks = [
        { id: '1', url: 'https://example1.com', email_id: '1' },
        { id: '2', url: 'https://example2.com', email_id: '1' },
      ];

      const filter = {
        url: 'example',
        categories: ['test'],
        emailId: '1',
        limit: 10,
        offset: 0,
      };

      mockClient.data = mockLinks;
      mockClient.error = null;

      const result = await dbOperations.queryLinks(filter);

      expect(mockClient.from).toHaveBeenCalledWith('links');
      expect(mockClient.ilike).toHaveBeenCalledWith('url', '%example%');
      expect(mockClient.contains).toHaveBeenCalledWith('categories', ['test']);
      expect(mockClient.eq).toHaveBeenCalledWith('email_id', '1');
      expect(mockClient.limit).toHaveBeenCalledWith(10);
      expect(mockClient.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockLinks);
    });

    it('should return empty array when no results found', async () => {
      mockClient.data = null;
      mockClient.error = null;

      const result = await dbOperations.queryLinks({});

      expect(mockClient.from).toHaveBeenCalledWith('links');
      expect(result).toEqual([]);
    });
  });

  describe('getEmailById', () => {
    it('should successfully get an email by ID', async () => {
      const mockEmail = {
        id: '1',
        sender: 'test@example.com',
        subject: 'Test',
        date: new Date(),
      };

      mockClient.data = mockEmail;
      mockClient.error = null;

      const result = await dbOperations.getEmailById('1');

      expect(mockClient.from).toHaveBeenCalledWith('emails');
      expect(mockClient.eq).toHaveBeenCalledWith('id', '1');
      expect(mockClient.single).toHaveBeenCalled();
      expect(result).toEqual(mockEmail);
    });

    it('should return null when email not found', async () => {
      mockClient.data = null;
      mockClient.error = { code: 'PGRST116' };

      const result = await dbOperations.getEmailById('1');

      expect(result).toBeNull();
    });
  });

  describe('getLinksByEmailId', () => {
    it('should successfully get links by email ID', async () => {
      const mockLinks = [
        { id: '1', url: 'https://example1.com', email_id: '1' },
        { id: '2', url: 'https://example2.com', email_id: '1' },
      ];

      mockClient.data = mockLinks;
      mockClient.error = null;

      const result = await dbOperations.getLinksByEmailId('1');

      expect(mockClient.from).toHaveBeenCalledWith('links');
      expect(mockClient.eq).toHaveBeenCalledWith('email_id', '1');
      expect(result).toEqual(mockLinks);
    });

    it('should return empty array when no links found', async () => {
      mockClient.data = null;
      mockClient.error = null;

      const result = await dbOperations.getLinksByEmailId('1');

      expect(mockClient.from).toHaveBeenCalledWith('links');
      expect(result).toEqual([]);
    });
  });
});
