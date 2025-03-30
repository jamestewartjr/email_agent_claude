import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, DatabaseErrorType } from '../types/database.js';

/**
 * Creates and manages a Supabase client connection
 */
const createSupabaseConnection = () => {
  let client: SupabaseClient | null = null;

  /**
   * Initialize the Supabase client connection
   * @throws {DatabaseError} If connection fails or environment variables are missing
   */
  const initialize = (): SupabaseClient => {
    if (client) {
      return client;
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Missing Supabase credentials in environment variables',
      );
    }

    try {
      client = createClient(url, key);
      return client;
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Failed to initialize Supabase client',
        error,
      );
    }
  };

  /**
   * Get the Supabase client instance
   * @throws {DatabaseError} If client is not initialized
   */
  const getClient = (): SupabaseClient => {
    if (!client) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Supabase client not initialized. Call initialize() first.',
      );
    }
    return client;
  };

  /**
   * Close the Supabase client connection
   * This is mainly used for testing purposes
   */
  const closeConnection = (): void => {
    client = null;
  };

  return {
    initialize,
    getClient,
    closeConnection,
  };
};

// Create a singleton instance
export const supabaseConnection = createSupabaseConnection();
