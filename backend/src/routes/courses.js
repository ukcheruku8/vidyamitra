import { Router } from "express"
import { authRequired, requireRole } from "../middleware/auth.js"
import { query } from "../db.js"

const router = Router()

// Creator: get courses for their tenant
router.get("/my-courses", authRequired, requireRole("creator"), async (req, res) => {
  try {
    const tenantId = req.user.tenant_id
    const { rows } = await query("SELECT * FROM courses WHERE tenant_id = $1 ORDER BY created_at DESC", [tenantId])
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Creator: create course for tenant
router.post("/", authRequired, requireRole("creator"), async (req, res) => {
  try {
    const tenantId = req.user.tenant_id
    const { title, description, price_in_inr, language, thumbnail_url, is_published } = req.body
    const { rows } = await query(
      `INSERT INTO courses (tenant_id, title, description, price_in_inr, language, thumbnail_url, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        tenantId,
        title,
        description || null,
        price_in_inr || 0,
        language || "en",
        thumbnail_url || null,
        !!is_published,
      ],
    )
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Public: get published courses from all tenants (marketplace)
router.get("/marketplace/courses", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*, t.name as tenant_name, t.branding_logo_url, t.primary_color
       FROM courses c
       JOIN tenants t ON c.tenant_id = t.id
       WHERE c.is_published = TRUE
       ORDER BY c.created_at DESC`,
    )
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Get course by id, include sections and lectures
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const cRes = await query(
      `SELECT c.*, t.name as tenant_name, t.branding_logo_url, t.primary_color
       FROM courses c JOIN tenants t ON c.tenant_id = t.id WHERE c.id = $1`,
      [id],
    )
    const course = cRes.rows[0]
    if (!course) return res.status(404).json({ error: "Not found" })

    const sRes = await query(`SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index ASC`, [id])
    const sections = sRes.rows
    const secIds = sections.map((s) => s.id)
    let lectures = []
    if (secIds.length) {
      const lRes = await query(`SELECT * FROM lectures WHERE section_id = ANY($1::uuid[]) ORDER BY order_index ASC`, [
        secIds,
      ])
      lectures = lRes.rows
    }

    return res.json({ course, sections, lectures })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Creator helpers: add sections/lectures (useful for Course Builder UI)
router.post("/:id/sections", authRequired, requireRole("creator"), async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user.tenant_id
    // Ensure course belongs to creator's tenant
    const c = await query("SELECT id FROM courses WHERE id = $1 AND tenant_id = $2", [id, tenantId])
    if (!c.rows[0]) return res.status(403).json({ error: "Forbidden" })

    const { title, order_index } = req.body
    const { rows } = await query(`INSERT INTO sections (course_id, title, order_index) VALUES ($1,$2,$3) RETURNING *`, [
      id,
      title,
      order_index || 0,
    ])
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

router.post("/sections/:sectionId/lectures", authRequired, requireRole("creator"), async (req, res) => {
  try {
    const { sectionId } = req.params
    const tenantId = req.user.tenant_id
    // ensure section belongs to creator's tenant
    const s = await query(
      `SELECT s.id, c.tenant_id FROM sections s JOIN courses c ON s.course_id = c.id WHERE s.id = $1`,
      [sectionId],
    )
    const sec = s.rows[0]
    if (!sec || sec.tenant_id !== tenantId) return res.status(403).json({ error: "Forbidden" })

    const { title, content_type, video_url, article_text, order_index, is_preview, duration_seconds } = req.body
    const { rows } = await query(
      `INSERT INTO lectures (section_id, title, content_type, video_url, article_text, order_index, is_preview, duration_seconds)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        sectionId,
        title,
        content_type,
        video_url || null,
        article_text || null,
        order_index || 0,
        !!is_preview,
        duration_seconds || 0,
      ],
    )
    return res.json(rows[0])
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
