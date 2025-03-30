import { SupabaseClient } from '@supabase/supabase-js';
import {
  Email,
  Link,
  EmailFilter,
  LinkFilter,
  DatabaseError,
  DatabaseErrorType,
} from '../types/database.js';
import { SupabaseConnection } from './client.js';

/**
 * Database operations for the Email Research Bot
 */
export class DatabaseOperations {
  private client: SupabaseClient;

  constructor() {
    this.client = SupabaseConnection.getInstance().initialize();
  }

  /**
   * Create a new email record
   * @param email Email data to insert
   * @returns Created email record
   * @throws {DatabaseError} If insertion fails
   */
  public async createEmail(email: Omit<Email, 'id' | 'created_at'>): Promise<Email> {
    try {
      const { data, error } = await this.client
        .from('emails')
        .insert([email])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to create email record', error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to create email record', error);
    }
  }

  /**
   * Create a new link record
   * @param link Link data to insert
   * @returns Created link record
   * @throws {DatabaseError} If insertion fails
   */
  public async createLink(link: Omit<Link, 'id' | 'created_at'>): Promise<Link> {
    try {
      const { data, error } = await this.client
        .from('links')
        .insert([link])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to create link record', error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to create link record', error);
    }
  }

  /**
   * Query emails with filters
   * @param filter Filter criteria for emails
   * @returns Array of matching email records
   * @throws {DatabaseError} If query fails
   */
  public async queryEmails(filter: EmailFilter): Promise<Email[]> {
    try {
      let query = this.client.from('emails').select('*');

      if (filter.sender) {
        query = query.ilike('sender', `%${filter.sender}%`);
      }
      if (filter.subject) {
        query = query.ilike('subject', `%${filter.subject}%`);
      }
      if (filter.dateFrom) {
        query = query.gte('date', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        query = query.lte('date', filter.dateTo.toISOString());
      }
      if (filter.processed !== undefined) {
        query = query.eq('processed', filter.processed);
      }
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, (filter.offset + (filter.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query emails', error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query emails', error);
    }
  }

  /**
   * Query links with filters
   * @param filter Filter criteria for links
   * @returns Array of matching link records
   * @throws {DatabaseError} If query fails
   */
  public async queryLinks(filter: LinkFilter): Promise<Link[]> {
    try {
      let query = this.client.from('links').select('*');

      if (filter.url) {
        query = query.ilike('url', `%${filter.url}%`);
      }
      if (filter.categories && filter.categories.length > 0) {
        query = query.contains('categories', filter.categories);
      }
      if (filter.emailId) {
        query = query.eq('email_id', filter.emailId);
      }
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, (filter.offset + (filter.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query links', error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query links', error);
    }
  }

  /**
   * Get an email by ID
   * @param id Email ID
   * @returns Email record or null if not found
   * @throws {DatabaseError} If query fails
   */
  public async getEmailById(id: string): Promise<Email | null> {
    try {
      const { data, error } = await this.client
        .from('emails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get email', error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get email', error);
    }
  }

  /**
   * Get links by email ID
   * @param emailId Email ID
   * @returns Array of link records
   * @throws {DatabaseError} If query fails
   */
  public async getLinksByEmailId(emailId: string): Promise<Link[]> {
    try {
      const { data, error } = await this.client
        .from('links')
        .select('*')
        .eq('email_id', emailId);

      if (error) {
        throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get links', error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get links', error);
    }
  }
} 