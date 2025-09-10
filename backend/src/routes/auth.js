import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { query } from "../db.js"
import { isValidIndianMobile } from "../utils/validators.js"

const router = Router()

// In-memory OTP store { mobile: { code, expiresAt } }
const otpStore = new Map()

router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile_number, password, role, tenant_id, tenant } = req.body
    if (!name || !mobile_number || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" })
    }
    if (!isValidIndianMobile(mobile_number)) {
      return res.status(400).json({ error: "Invalid Indian mobile format" })
    }
    if (!["creator", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    let assignedTenantId = tenant_id || null
    if (role === "creator") {
      // Optionally create tenant on the fly
      if (!assignedTenantId && tenant && tenant.name) {
        const tRes = await query(
          "INSERT INTO tenants (name, branding_logo_url, primary_color) VALUES ($1,$2,$3) RETURNING id",
          [tenant.name, tenant.branding_logo_url || null, tenant.primary_color || "#2563eb"],
        )
        assignedTenantId = tRes.rows[0].id
      }
    }

    const password_hash = await bcrypt.hash(password, 10)
    const uRes = await query(
      `INSERT INTO users (name, email, mobile_number, password_hash, role, tenant_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, mobile_number, role, tenant_id`,
      [name, email || null, mobile_number, password_hash, role, assignedTenantId],
    )
    const user = uRes.rows[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    return res.json({ user, token })
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ error: "Email or mobile already exists" })
    }
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, mobile_number, password } = req.body
    if ((!email && !mobile_number) || !password) {
      return res.status(400).json({ error: "Missing fields" })
    }
    const { rows } = await query(
      `SELECT id, name, email, mobile_number, password_hash, role, tenant_id
       FROM users WHERE ($1::text IS NOT NULL AND email = $1) OR ($2::text IS NOT NULL AND mobile_number = $2)`,
      [email || null, mobile_number || null],
    )
    const user = rows[0]
    if (!user) return res.status(400).json({ error: "Invalid credentials" })
    const ok = await bcrypt.compare(password, user.password_hash || "")
    if (!ok) return res.status(400).json({ error: "Invalid credentials" })
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    delete user.password_hash
    return res.json({ user, token })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Mock OTP send
router.post("/otp/send", async (req, res) => {
  const { mobile_number } = req.body
  if (!mobile_number || !isValidIndianMobile(mobile_number)) {
    return res.status(400).json({ error: "Invalid mobile number" })
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 5 * 60 * 1000
  otpStore.set(mobile_number, { code, expiresAt })
  console.log("[OTP] Sending OTP to", mobile_number, "code:", code)
  return res.json({ success: true })
})

// Mock OTP verify -> login via OTP
router.post("/otp/verify", async (req, res) => {
  const { mobile_number, code } = req.body
  const rec = otpStore.get(mobile_number)
  if (!rec || rec.expiresAt < Date.now()) {
    return res.status(400).json({ error: "OTP expired or not found" })
  }
  if (rec.code !== code) return res.status(400).json({ error: "Invalid OTP" })

  const { rows } = await query(
    "SELECT id, name, email, mobile_number, role, tenant_id FROM users WHERE mobile_number = $1",
    [mobile_number],
  )
  const user = rows[0]
  if (!user) return res.status(400).json({ error: "User not found, please register" })
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
  otpStore.delete(mobile_number)
  return res.json({ user, token })
})

export default router
