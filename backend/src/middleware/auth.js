import jwt from "jsonwebtoken"
import { query } from "../db.js"

export async function authRequired(req, res, next) {
  const auth = req.headers.authorization || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: "Unauthorized" })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { rows } = await query("SELECT id, name, email, mobile_number, role, tenant_id FROM users WHERE id = $1", [
      payload.userId,
    ])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: "Unauthorized" })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: "Forbidden" })
    next()
  }
}
