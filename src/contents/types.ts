export type ShopifyStatus = {
  isShopify: boolean
  url: string
  hostname: string
  signals: string[]
  themeName?: string
  apps: string[]
  loginStatus: "logged-in" | "logged-out" | "unknown"
  loginUrl: string
}

export type ShopifyProduct = {
  id: number
  title: string
  handle: string
  published_at?: string | null
  created_at?: string | null
  sales?: number
  total_sales?: number
  sold?: number
  order_count?: number
  vendor?: string
  product_type?: string
  description?: string
  body_html?: string
  tags?: string[] | string
  status?: string
  images?: ShopifyImage[]
  variants?: ShopifyVariant[]
  options?: Array<{ name?: string; values?: string[] }>
  rating?: number
  review_count?: number
  recommendation_rate?: number
  recommended_products?: string[]
  delivery_and_returns?: string
  payment_methods?: string[]
  page_price?: string
  page_compare_at_price?: string
  page_color?: string
  page_fit?: string
  page_badges?: string[]
}

export type ShopifyImage = {
  id?: number
  src?: string
  alt?: string | null
  width?: number
  height?: number
}

export type ShopifyVariant = {
  id?: number
  title?: string
  price?: string
  compare_at_price?: string | null
  sku?: string | null
  available?: boolean
  availability?: string
  inventory_quantity?: number
  option1?: string | null
  option2?: string | null
  option3?: string | null
}

export type ProductsResponse = { products?: ShopifyProduct[] }