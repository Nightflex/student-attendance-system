// lib/db.ts
import { neon } from "@neondatabase/serverless"

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

export async function executeQuery(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  try {
    const result = await sql(strings, ...values)
    return result as any[]
  } catch (error) {
    handleDatabaseError(error, "execute query")
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (sql: typeof import("@neondatabase/serverless").neon) => Promise<T>,
): Promise<T> {
  try {
    // Note: Neon serverless doesn't support explicit transactions
    // but provides ACID guarantees for individual queries
    return await callback(sql)
  } catch (error) {
    handleDatabaseError(error, "execute transaction")
  }
}