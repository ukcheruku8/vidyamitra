import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import coursesRoutes from "./routes/courses.js"
import learningRoutes from "./routes/learning.js"

dotenv.config()

const app = express()
app.use(cors({ origin: "http://localhost:5173", credentials: false }))
app.use(express.json({ limit: "2mb" }))

app.get("/health", (req, res) => res.json({ ok: true }))

app.use("/api/auth", authRoutes)
app.use("/api/courses", coursesRoutes)
app.use("/api/learning", learningRoutes)

// Marketplace route alias for clarity
app.get("/api/marketplace/courses", coursesRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
