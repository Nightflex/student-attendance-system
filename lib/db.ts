// lib/db.ts
import { neon, NeonQueryFunction } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create the SQL client
export const sql = neon(process.env.DATABASE_URL)

// Database utility functions
export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

// Helper function to handle database errors
export function handleDatabaseError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error)
  throw new DatabaseError(`Failed to ${operation}`, error)
}

interface QueryResult {
  [key: string]: unknown;
}

export async function executeQuery(strings: TemplateStringsArray, ...values: unknown[]): Promise<QueryResult[]> {
  try {
    const result = await sql(strings, ...values)
    return result as QueryResult[]
  } catch (error) {
    handleDatabaseError(error, "execute query")
  }
}

export async function withTransaction<T>(
  callback: (sql: NeonQueryFunction<false, false>) => Promise<T>,
): Promise<T> {
  try {
    return await callback(sql)
  } catch (error) {
    handleDatabaseError(error, "execute transaction")
  }
}