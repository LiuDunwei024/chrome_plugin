import type { ShopifyProduct } from "./types"

export type ProductSortMode = "best-selling" | "newest"

export function sortProducts(products: ShopifyProduct[], mode: ProductSortMode) {
  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const comparison = mode === "best-selling"
        ? getSalesScore(right.product) - getSalesScore(left.product)
        : getDateScore(right.product) - getDateScore(left.product)

      return comparison || left.index - right.index
    })
    .map(({ product }) => product)
}

export function hasSalesData(products: ShopifyProduct[]) {
  return products.some((product) => getSalesScore(product) > 0)
}

function getSalesScore(product: ShopifyProduct) {
  return product.sales ?? product.total_sales ?? product.sold ?? product.order_count ?? 0
}

function getDateScore(product: ShopifyProduct) {
  const value = product.published_at ?? product.created_at
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}