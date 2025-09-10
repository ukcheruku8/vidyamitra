export function isValidIndianMobile(mobile) {
  return /^(?:\+91)?[6-9]\d{9}$/.test(mobile)
}

export function toSlug(title, id) {
  return (
    `${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${id}`
  )
}

export function idFromSlug(slug) {
  const parts = slug.split("-")
  return parts[parts.length - 1]
}
