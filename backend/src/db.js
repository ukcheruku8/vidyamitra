import { neon, neonConfig } from "@neondatabase/serverless"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

// cache connections between invocations in serverless
neonConfig.fetchConnectionCache = true

// create singleton sql client
export const sql = neon(connectionString)

/**
 * A pg-compatible query wrapper.
 * Accepts (text, params) and returns { rows, rowCount }.
 */
export async function query(text, params = []) {
  const start = Date.now()
  let result
  try {
    // Neon supports parameter arrays: sql(text, params)
    result = await sql(text, params)
  } finally {
    const duration = Date.now() - start
    const rowsCount = Array.isArray(result) ? result.length : (result?.rowCount ?? 0)
    if (process.env.DEBUG_SQL === "true") {
      console.log("[sql]", { text, duration, rows: rowsCount })
    }
  }

  // Normalize to pg-like shape
  if (Array.isArray(result)) {
    return { rows: result, rowCount: result.length }
  }
  return result
}
