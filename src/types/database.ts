/**
 * Database types for the Email Research Bot
 */

/**
 * Represents attachment metadata
 */
export interface AttachmentInfo {
  filename: string;
  mime_type: string;
  size: number;
}

/**
 * Represents an email record in the database
 */
export interface Email {
  id: string;
  sender: string;
  subject: string;
  date: Date;
  body_text: string | null;
  body_html: string | null;
  attachment_info: AttachmentInfo[] | null;
  processed: boolean;
  created_at: Date;
}

/**
 * Represents a link found in an email
 */
export interface Link {
  id: string;
  url: string;
  anchor_text: string | null;
  surrounding_context: string | null;
  categories: string[];
  email_id: string;
  created_at: Date;
}

/**
 * Filter options for querying emails
 */
export interface EmailFilter {
  sender?: string;
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  processed?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Filter options for querying links
 */
export interface LinkFilter {
  url?: string;
  categories?: string[];
  emailId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Database error types
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  constructor(
    public type: DatabaseErrorType,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
