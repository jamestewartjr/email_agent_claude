import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, DatabaseErrorType } from '../types/database.js';

/**
 * Singleton class for managing Supabase client connection
 */
export class SupabaseConnection {
  private static instance: SupabaseConnection;
  private client: SupabaseClient | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of SupabaseConnection
   */
  public static getInstance(): SupabaseConnection {
    if (!SupabaseConnection.instance) {
      SupabaseConnection.instance = new SupabaseConnection();
    }
    return SupabaseConnection.instance;
  }

  /**
   * Initialize the Supabase client connection
   * @throws {DatabaseError} If connection fails or environment variables are missing
   */
  public initialize(): SupabaseClient {
    if (this.client) {
      return this.client;
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
      this.client = createClient(url, key);
      return this.client;
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Failed to initialize Supabase client',
        error,
      );
    }
  }

  /**
   * Get the Supabase client instance
   * @throws {DatabaseError} If client is not initialized
   */
  public getClient(): SupabaseClient {
    if (!this.client) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Supabase client not initialized. Call initialize() first.',
      );
    }
    return this.client;
  }

  /**
   * Close the Supabase client connection
   * This is mainly used for testing purposes
   */
  public closeConnection(): void {
    this.client = null;
  }
} 