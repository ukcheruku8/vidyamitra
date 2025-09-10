import { Link } from "react-router-dom"

function toSlug(title, id) {
  return `${String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${id}`
}

export default function CourseCard({ course }) {
  const slug = toSlug(course.title, course.id)
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition">
      <img
        src={course.thumbnail_url || "/placeholder.svg?height=160&width=320&query=course-thumbnail"}
        alt="Course thumbnail"
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-pretty">{course.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-brand font-semibold">₹{course.price_in_inr}</span>
          <Link to={`/learn/course/${slug}`} className="text-sm text-accent hover:underline">
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
