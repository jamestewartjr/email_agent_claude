import { SupabaseClient } from '@supabase/supabase-js';
import {
  Email,
  Link,
  EmailFilter,
  LinkFilter,
  DatabaseError,
  DatabaseErrorType,
} from '../types/database.js';
import { supabaseConnection } from './client.js';

type DatabaseResult<T> = Promise<T>;
type DatabaseOperation<T> = (client: SupabaseClient) => DatabaseResult<T>;

/**
 * Creates a database operation handler with error handling
 */
const withErrorHandling = <T>(
  operation: DatabaseOperation<T>,
  errorMessage: string,
): DatabaseOperation<T> => {
  return async (client: SupabaseClient): DatabaseResult<T> => {
    try {
      return await operation(client);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, errorMessage, error);
    }
  };
};

/**
 * Creates a new email record
 */
export const createEmail = (email: Omit<Email, 'id' | 'created_at'>): DatabaseOperation<Email> =>
  withErrorHandling(async (client) => {
    const { data, error } = await client.from('emails').insert([email]).select().single();

    if (error) {
      throw new DatabaseError(
        DatabaseErrorType.QUERY_ERROR,
        'Failed to create email record',
        error,
      );
    }

    return data;
  }, 'Failed to create email record');

/**
 * Creates a new link record
 */
export const createLink = (link: Omit<Link, 'id' | 'created_at'>): DatabaseOperation<Link> =>
  withErrorHandling(async (client) => {
    const { data, error } = await client.from('links').insert([link]).select().single();

    if (error) {
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to create link record', error);
    }

    return data;
  }, 'Failed to create link record');

/**
 * Builds a query for emails based on filter criteria
 */
const buildEmailQuery = (client: SupabaseClient, filter: EmailFilter) => {
  let query = client.from('emails').select('*');

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
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
  }

  return query;
};

/**
 * Queries emails with filters
 */
export const queryEmails = (filter: EmailFilter): DatabaseOperation<Email[]> =>
  withErrorHandling(async (client) => {
    const { data, error } = await buildEmailQuery(client, filter);

    if (error) {
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query emails', error);
    }

    return data || [];
  }, 'Failed to query emails');

/**
 * Builds a query for links based on filter criteria
 */
const buildLinkQuery = (client: SupabaseClient, filter: LinkFilter) => {
  let query = client.from('links').select('*');

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
    query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
  }

  return query;
};

/**
 * Queries links with filters
 */
export const queryLinks = (filter: LinkFilter): DatabaseOperation<Link[]> =>
  withErrorHandling(async (client) => {
    const { data, error } = await buildLinkQuery(client, filter);

    if (error) {
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to query links', error);
    }

    return data || [];
  }, 'Failed to query links');

/**
 * Gets an email by ID
 */
export const getEmailById = (id: string): DatabaseOperation<Email | null> =>
  withErrorHandling(async (client) => {
    const { data, error } = await client.from('emails').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get email', error);
    }

    return data;
  }, 'Failed to get email');

/**
 * Gets links by email ID
 */
export const getLinksByEmailId = (emailId: string): DatabaseOperation<Link[]> =>
  withErrorHandling(async (client) => {
    const { data, error } = await client.from('links').select('*').eq('email_id', emailId);

    if (error) {
      throw new DatabaseError(DatabaseErrorType.QUERY_ERROR, 'Failed to get links', error);
    }

    return data || [];
  }, 'Failed to get links');

/**
 * Creates a database operations instance with a specific client
 */
export const createDatabaseOperations = (
  client: SupabaseClient = supabaseConnection.initialize(),
) => ({
  createEmail: (email: Omit<Email, 'id' | 'created_at'>) => createEmail(email)(client),
  createLink: (link: Omit<Link, 'id' | 'created_at'>) => createLink(link)(client),
  queryEmails: (filter: EmailFilter) => queryEmails(filter)(client),
  queryLinks: (filter: LinkFilter) => queryLinks(filter)(client),
  getEmailById: (id: string) => getEmailById(id)(client),
  getLinksByEmailId: (emailId: string) => getLinksByEmailId(emailId)(client),
});
