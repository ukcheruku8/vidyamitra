"use client"

import { useEffect, useState } from "react"
import api from "../api/axios.js"
import CourseCard from "../components/CourseCard.jsx"

export default function StudentDashboard() {
  const [courses, setCourses] = useState([])
  useEffect(() => {
    api.get("/learning/my-courses").then((res) => setCourses(res.data))
  }, [])
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
      {courses.length === 0 ? (
        <div className="text-gray-600">No courses enrolled yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
