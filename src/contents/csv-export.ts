import type { ShopifyProduct } from "./types"

const csvHeaders = [
  "Title",
  "URL",
  "Price",
  "Compare At Price",
  "Vendor",
  "Product Type",
  "Status",
  "Published At",
  "Created At",
  "Sales",
  "Handle",
  "Tags",
  "Description",
  "Images",
  "Variants",
  "Options",
  "Rating",
  "Review Count",
  "Recommendation Rate",
  "Recommended Products",
  "Delivery & Returns",
  "Payment Methods",
  "Color",
  "Fit",
  "Badges"
]

export function downloadProductsCsv(products: ShopifyProduct[], hostname: string) {
  const rows = products.map((product) => [
    product.title,
    new URL(`/products/${product.handle}`, location.origin).href,
    product.page_price ?? product.variants?.[0]?.price ?? "",
    product.page_compare_at_price ?? product.variants?.[0]?.compare_at_price ?? "",
    product.vendor ?? "",
    product.product_type ?? "",
    product.status ?? "",
    product.published_at ?? "",
    product.created_at ?? "",
    getSalesValue(product),
    product.handle,
    formatTags(product.tags),
    stripHtml(product.description || product.body_html || ""),
    product.images?.map((image) => image.src).filter(Boolean).join(" | ") ?? "",
    product.variants?.map((variant) => [variant.title, variant.price, variant.sku, variant.available, variant.availability, variant.inventory_quantity].filter((value) => value !== undefined).join(" / ")).join(" | ") ?? "",
    product.options?.map((option) => `${option.name}: ${(option.values ?? []).join(" / ")}`).join(" | ") ?? "",
    product.rating ?? "",
    product.review_count ?? "",
    product.recommendation_rate ? `${product.recommendation_rate}%` : "",
    product.recommended_products?.join(" | ") ?? "",
    product.delivery_and_returns ?? "",
    product.payment_methods?.join(" | ") ?? "",
    product.page_color ?? "",
    product.page_fit ?? "",
    product.page_badges?.join(" | ") ?? ""
  ])
  const csv = [csvHeaders, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n")
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `competitor-analysis-${sanitizeFilename(hostname)}-${date}.csv`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function getSalesValue(product: ShopifyProduct) {
  return product.sales ?? product.total_sales ?? product.sold ?? product.order_count ?? ""
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? "")
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-+|-+$/g, "") || "store"
}

function formatTags(tags: ShopifyProduct["tags"]) {
  return Array.isArray(tags) ? tags.join(" | ") : tags ?? ""
}

function stripHtml(value: string) {
  const element = document.createElement("div")
  element.innerHTML = value
  return (element.textContent || "").replace(/\s+/g, " ").trim()
}