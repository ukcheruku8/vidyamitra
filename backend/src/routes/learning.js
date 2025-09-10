import { Router } from "express"
import { authRequired, requireRole } from "../middleware/auth.js"
import { query } from "../db.js"

const router = Router()

// Student: enroll in course (mock payment)
router.post("/enroll/:courseId", authRequired, requireRole("student"), async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    // get course price
    const cRes = await query("SELECT id, price_in_inr FROM courses WHERE id = $1", [courseId])
    const course = cRes.rows[0]
    if (!course) return res.status(404).json({ error: "Course not found" })

    // Mock payment success
    const payment_gateway_id = `razorpay_mock_${Date.now()}`
    await query(
      `INSERT INTO transactions (user_id, course_id, amount_in_inr, payment_gateway_id, status)
       VALUES ($1,$2,$3,$4,'success')`,
      [userId, courseId, course.price_in_inr, payment_gateway_id],
    )

    // Create enrollment if not exists
    await query(
      `INSERT INTO enrollments (course_id, user_id) VALUES ($1,$2)
       ON CONFLICT (course_id, user_id) DO NOTHING`,
      [courseId, userId],
    )

    return res.json({ success: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Student: my courses
router.get("/my-courses", authRequired, requireRole("student"), async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT e.id as enrollment_id, c.*
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id],
    )
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Student: get course content (must be enrolled)
router.get("/course/:courseId", authRequired, requireRole("student"), async (req, res) => {
  try {
    const { courseId } = req.params
    // verify enrollment
    const en = await query(`SELECT 1 FROM enrollments WHERE course_id = $1 AND user_id = $2`, [courseId, req.user.id])
    if (!en.rows[0]) return res.status(403).json({ error: "Not enrolled" })

    // course with sections/lectures
    const cRes = await query("SELECT * FROM courses WHERE id = $1", [courseId])
    const course = cRes.rows[0]
    if (!course) return res.status(404).json({ error: "Not found" })
    const sRes = await query("SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index", [courseId])
    const sections = sRes.rows
    let lectures = []
    if (sections.length) {
      const ids = sections.map((s) => s.id)
      const lRes = await query("SELECT * FROM lectures WHERE section_id = ANY($1::uuid[]) ORDER BY order_index", [ids])
      lectures = lRes.rows
    }

    // progress
    const pRes = await query(
      "SELECT lecture_id, is_completed, completed_at FROM lecture_progress WHERE user_id = $1 AND lecture_id = ANY($2::uuid[])",
      [req.user.id, lectures.map((l) => l.id)],
    )
    const progress = pRes.rows

    return res.json({ course, sections, lectures, progress })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// Student: update progress
router.post("/progress", authRequired, requireRole("student"), async (req, res) => {
  try {
    const { lecture_id, is_completed } = req.body
    if (!lecture_id) return res.status(400).json({ error: "lecture_id required" })
    if (typeof is_completed !== "boolean") return res.status(400).json({ error: "is_completed must be boolean" })

    await query(
      `INSERT INTO lecture_progress (user_id, lecture_id, is_completed, completed_at)
       VALUES ($1,$2,$3, CASE WHEN $3 THEN NOW() ELSE NULL END)
       ON CONFLICT (user_id, lecture_id) DO UPDATE
         SET is_completed = EXCLUDED.is_completed,
             completed_at = CASE WHEN EXCLUDED.is_completed THEN NOW() ELSE NULL END`,
      [req.user.id, lecture_id, is_completed],
    )

    return res.json({ success: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
