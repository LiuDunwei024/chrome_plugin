import type { ProductsResponse, ShopifyProduct } from "./types"
import type { ProductSortMode } from "./product-sorting"

const productEndpoints = ["/products.json?limit=250", "/collections/all/products.json?limit=250"]

export type ProductFetchResult = {
  products: ShopifyProduct[]
  serverSortedMode?: ProductSortMode
}

export async function fetchProducts(signal: AbortSignal, mode: ProductSortMode): Promise<ProductFetchResult> {
  let lastStatus = 0
  const sortQuery = mode === "best-selling" ? "best-selling" : "created-descending"
  const endpoints = [
    ...getCollectionEndpoints(sortQuery),
    `/products.json?sort_by=${sortQuery}&limit=250`,
    `/collections/all/products.json?sort_by=${sortQuery}&limit=250`,
    ...productEndpoints.filter((endpoint) => !endpoint.includes("sort_by="))
  ]

  for (const endpoint of endpoints) {
    const result = await fetchProductPages(endpoint, signal)
    lastStatus = result.status
    console.info("[Competitor Analysis]", `${endpoint} response`, result.status, result.statusText)
    if (result.products) {
      return {
        products: mergePageProductData(result.products, endpoint.includes("/collections/") && endpoint.includes("/products.json")),
        serverSortedMode: endpoint.includes("sort_by=") ? mode : undefined
      }
    }
  }
  if (lastStatus === 404) {
    return { products: extractProductsFromPage() }
  }
  throw new Error(lastStatus === 403 ? "This store blocks Shopify product JSON endpoints (403)." : `Product endpoints failed with status ${lastStatus}.`)
}

function extractProductsFromPage() {
  const products = new Map<string, ShopifyProduct>()
  const currentHandle = location.pathname.match(/\/products\/([^/]+)/)?.[1]
  const pagePrice = readPagePrice()
  const pageDetails = readPageDetails()
  const pageCards = readPageProductCards()
  for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(script.textContent || "null") as unknown
      const candidates = Array.isArray(parsed) ? parsed : typeof parsed === "object" && parsed !== null && "@graph" in parsed ? (parsed as { "@graph": unknown[] })["@graph"] : [parsed]
      for (const candidate of candidates) {
        if (!isJsonLdProduct(candidate)) continue
        const url = typeof candidate.url === "string" ? new URL(candidate.url, location.origin) : null
        const handle = url?.pathname.match(/\/products\/([^/]+)/)?.[1]
        if (!handle || products.has(handle)) continue
        const images = (Array.isArray(candidate.image) ? candidate.image : [candidate.image]).filter((image): image is string => typeof image === "string").map((src) => ({ src }))
        const offers = Array.isArray(candidate.offers) ? candidate.offers : candidate.offers ? [candidate.offers] : []
        const variants = offers.map((offer) => ({
          title: offer.name,
          price: offer.price === undefined ? undefined : String(offer.price),
          sku: offer.sku,
          available: offer.availability ? offer.availability.endsWith("InStock") : undefined,
          availability: offer.availability
        })).filter((variant) => variant.price || variant.sku || variant.title)
        const brand = typeof candidate.brand === "object" && candidate.brand !== null ? candidate.brand.name : candidate.brand
        const aggregateRating = candidate.aggregateRating
        if (handle === currentHandle && pagePrice) variants.unshift(pagePrice)

        products.set(handle, {
          id: createProductId(handle, products.size),
          title: candidate.name,
          handle,
          published_at: candidate.datePublished ?? candidate.releaseDate,
          vendor: typeof brand === "string" ? brand : undefined,
          product_type: candidate.category,
          description: candidate.description,
          images: images.length > 0 ? images : undefined,
          variants: variants.length > 0 ? variants : undefined,
          options: handle === currentHandle ? extractPageOptions() : undefined,
          ...(handle === currentHandle ? {
            ...pageDetails,
            rating: aggregateRating?.ratingValue === undefined ? pageDetails.rating : Number(aggregateRating.ratingValue),
            review_count: aggregateRating?.reviewCount === undefined ? pageDetails.review_count : Number(aggregateRating.reviewCount)
          } : {})
        })
      }
    } catch { continue }
  }
  document.querySelectorAll<HTMLAnchorElement>('a[href*="/products/"]').forEach((link) => {
    const handle = new URL(link.href, location.origin).pathname.match(/\/products\/([^/]+)/)?.[1]
    if (!handle || products.has(handle)) return
    const image = link.querySelector<HTMLImageElement>("img")
    const title = (image?.alt || link.textContent || "").trim().replace(/\s+/g, " ")
    if (title) {
      products.set(handle, {
        id: createProductId(handle, products.size),
        title,
        handle,
        images: image?.src ? [{ src: image.src, alt: image.alt }] : undefined,
        variants: handle === currentHandle && pagePrice ? [pagePrice] : undefined,
        ...(handle === currentHandle ? pageDetails : {})
      })
    }
  })
  const pageProducts = [...products.values()].map((product) => applyPageCard(product, pageCards.get(product.handle)))
  if (isCollectionPage() && pageCards.size > 0) {
    return pageProducts.filter((product) => pageCards.has(product.handle))
  }
  return pageProducts
}

function mergeCurrentPageProduct(products: ShopifyProduct[]) {
  const currentHandle = location.pathname.match(/\/products\/([^/]+)/)?.[1]
  if (!currentHandle) return products

  const pageProduct = extractProductsFromPage().find((product) => product.handle === currentHandle)
  if (!pageProduct) return products

  const existing = products.find((product) => product.handle === currentHandle)
  if (!existing) return [...products, pageProduct]

  return products.map((product) => product.handle === currentHandle ? {
    ...product,
    title: pageProduct.title || product.title,
    description: pageProduct.description || product.description,
    vendor: pageProduct.vendor || product.vendor,
    product_type: pageProduct.product_type || product.product_type,
    images: mergeImages(product.images, pageProduct.images),
    variants: mergeVariants(product.variants, pageProduct.variants),
    options: product.options || extractPageOptions(),
    rating: pageProduct.rating ?? product.rating,
    review_count: pageProduct.review_count ?? product.review_count,
    recommendation_rate: pageProduct.recommendation_rate ?? product.recommendation_rate,
    recommended_products: pageProduct.recommended_products ?? product.recommended_products,
    delivery_and_returns: pageProduct.delivery_and_returns ?? product.delivery_and_returns,
    payment_methods: pageProduct.payment_methods ?? product.payment_methods
  } : product)
}

function mergeImages(existing: ShopifyProduct["images"], pageImages: ShopifyProduct["images"]) {
  const images = [...(existing ?? []), ...(pageImages ?? [])]
  const seen = new Set<string>()
  return images.filter((image) => {
    if (!image.src || seen.has(image.src)) return false
    seen.add(image.src)
    return true
  })
}

function mergeVariants(existing: ShopifyProduct["variants"], pageVariants: ShopifyProduct["variants"]) {
  if (!pageVariants?.length) return existing
  if (!existing?.length) return pageVariants
  return existing.map((variant, index) => ({ ...variant, ...pageVariants[index] }))
}

function extractPageOptions() {
  const options = new Map<string, string[]>()
  document.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
    const name = select.name || select.getAttribute("aria-label") || select.id
    const values = [...select.options].map((option) => option.textContent?.trim()).filter((value): value is string => Boolean(value))
    if (name && values.length) options.set(name, values)
  })
  document.querySelectorAll<HTMLElement>("fieldset, [role='group']").forEach((group) => {
    const name = group.querySelector("legend")?.textContent?.trim() || group.getAttribute("aria-label")?.trim()
    const values = [...group.querySelectorAll<HTMLButtonElement>("button")]
      .map((button) => button.textContent?.trim() || button.getAttribute("aria-label")?.trim())
      .filter((value): value is string => Boolean(value))
    if (name && values.length) options.set(name, [...new Set(values)])
  })
  return [...options.entries()].map(([name, values]) => ({ name, values }))
}

function readPageDetails(): Pick<ShopifyProduct, "recommendation_rate" | "recommended_products" | "delivery_and_returns" | "payment_methods"> & { rating?: number; review_count?: number } {
  const pageText = normalizeText(document.body?.textContent || "")
  const rating = pageText.match(/(?:rating|rated)\s*[:\-]?\s*(\d(?:\.\d)?)\s*(?:out of 5|\/5)?/i)?.[1]
  const reviewCount = pageText.match(/based on\s*([\d,]+)\s*reviews?/i)?.[1]
  const recommendationRate = pageText.match(/([\d.]+)%\s+of customers would recommend/i)?.[1]
  const recommendedProducts = readSectionLinks(/get\s+the\s+look/i)
  const deliveryAndReturns = readSectionText(/delivery\s*&?\s*returns/i)
  const paymentMethods = [...new Set((pageText.match(/paypal|klarna|afterpay|sezzle/gi) || []).map((method) => method[0].toUpperCase() + method.slice(1).toLowerCase()))]

  return {
    rating: rating ? Number(rating) : undefined,
    review_count: reviewCount ? Number(reviewCount.replace(/,/g, "")) : undefined,
    recommendation_rate: recommendationRate ? Number(recommendationRate) : undefined,
    recommended_products: recommendedProducts.length ? recommendedProducts : undefined,
    delivery_and_returns: deliveryAndReturns,
    payment_methods: paymentMethods.length ? paymentMethods : undefined
  }
}

function readSectionText(pattern: RegExp) {
  const heading = [...document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, button")].find((element) => pattern.test(normalizeText(element.textContent || "")))
  const section = heading?.closest("section, article, [role='region']")
  const text = section ? normalizeText(section.textContent || "") : ""
  return text || undefined
}

function readSectionLinks(pattern: RegExp) {
  const products = new Map<string, string>()
  document.querySelectorAll<HTMLElement>("h1, h2, h3, h4").forEach((heading) => {
    if (!pattern.test(normalizeText(heading.textContent || ""))) return
    const section = heading.closest("section, article, [role='region']")
    section?.querySelectorAll<HTMLAnchorElement>("a[href*='/products/']").forEach((link) => {
      const handle = new URL(link.href, location.origin).pathname.match(/\/products\/([^/]+)/)?.[1]
      const title = normalizeText(link.textContent || link.querySelector("img")?.getAttribute("alt") || "")
      if (handle && title) products.set(handle, title)
    })
  })
  return [...products.values()]
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function readPagePrice() {
  const currentPrice = document.querySelector('[data-testid="pdp-totalValue-read"]')?.textContent?.trim()
  if (!currentPrice) return undefined

  const compareAtPrice = document.querySelector('[data-testid="pdp-compareAtValue-read"]')?.textContent?.trim()
  return { price: currentPrice, compare_at_price: compareAtPrice || undefined }
}

function createProductId(value: string, index: number) {
  let hash = 0
  for (const character of value) { hash = (hash << 5) - hash + character.charCodeAt(0); hash |= 0 }
  return Math.abs(hash) || index + 1
}

function isJsonLdProduct(value: unknown): value is {
  "@type": string | string[]
  name: string
  url?: string
  image?: string | string[]
  description?: string
  category?: string
  brand?: string | { name?: string }
  datePublished?: string
  releaseDate?: string
  aggregateRating?: { ratingValue?: unknown; reviewCount?: unknown }
  offers?: Array<{ price?: unknown; name?: string; sku?: string; availability?: string; priceValidUntil?: string; itemCondition?: string }> | { price?: unknown; name?: string; sku?: string; availability?: string; priceValidUntil?: string; itemCondition?: string }
} {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as { "@type"?: unknown; name?: unknown }
  return (candidate["@type"] === "Product" || (Array.isArray(candidate["@type"]) && candidate["@type"].includes("Product"))) && typeof candidate.name === "string"
}

async function fetchProductPages(endpoint: string, signal: AbortSignal) {
  const products = new Map<string, ShopifyProduct>()
  let page = 1
  let response: Response
  let previousPageSignature = ""

  do {
    const url = new URL(endpoint, location.origin)
    url.searchParams.set("page", String(page))
    response = await fetch(url, { credentials: "include", headers: { Accept: "application/json" }, signal })

    if (!response.ok) {
      return { status: response.status, statusText: response.statusText, products: undefined }
    }

    const pageProducts = ((await response.json()) as ProductsResponse).products ?? []
    const pageSignature = pageProducts.map((product) => product.handle || String(product.id)).join("|")
    if (!pageProducts.length || pageSignature === previousPageSignature) break
    previousPageSignature = pageSignature
    pageProducts.forEach((product) => {
      if (product.handle && !products.has(product.handle)) products.set(product.handle, product)
    })
    page += 1

    if (pageProducts.length < 250) break
  } while (page <= 100)

  return { status: response.status, statusText: response.statusText, products: [...products.values()] }
}

function mergePageProductData(products: ShopifyProduct[], isCollectionApi = false) {
  const pageCards = readPageProductCards()
  const pageHandles = new Set(pageCards.keys())
  const scopedProducts = isCollectionPage() && !isCollectionApi && pageHandles.size > 0
    ? products.filter((product) => pageHandles.has(product.handle))
    : products
  const mergedProducts = scopedProducts.map((product) => {
    const pageCard = pageCards.get(product.handle)
    return applyPageCard(product, pageCard)
  })
  const missingProducts = [...pageCards.keys()]
    .filter((handle) => !mergedProducts.some((product) => product.handle === handle))
    .map((handle, index) => createPageProduct(handle, pageCards.get(handle), index))
    .filter((product): product is ShopifyProduct => Boolean(product))
  return mergeCurrentPageProduct([...mergedProducts, ...missingProducts])
}

function isCollectionPage() {
  return /^\/collections\/[^/]+/.test(location.pathname)
}

function createPageProduct(handle: string, pageCard: ReturnType<typeof readPageProductCards> extends Map<string, infer Card> ? Card : never | undefined, index: number) {
  const link = [...document.querySelectorAll<HTMLAnchorElement>("a[href*='/products/']")].find((candidate) => candidate.href.includes(`/products/${handle}`))
  const title = link?.getAttribute("title") || link?.textContent?.trim() || handle.replace(/-/g, " ")
  if (!title) return undefined
  return applyPageCard({
    id: createProductId(handle, index),
    title,
    handle,
    images: link?.querySelector<HTMLImageElement>("img")?.src ? [{ src: link.querySelector<HTMLImageElement>("img")?.src, alt: link.querySelector<HTMLImageElement>("img")?.alt }] : undefined
  }, pageCard)
}

function applyPageCard(product: ShopifyProduct, pageCard?: {
  price?: string
  compareAtPrice?: string
  rating?: number
  color?: string
  fit?: string
  badges?: string[]
}) {
  if (!pageCard) return product
  return {
    ...product,
    rating: pageCard.rating ?? product.rating,
    page_price: pageCard.price ?? product.page_price,
    page_compare_at_price: pageCard.compareAtPrice ?? product.page_compare_at_price,
    page_color: pageCard.color ?? product.page_color,
    page_fit: pageCard.fit ?? product.page_fit,
    page_badges: pageCard.badges ?? product.page_badges
  }
}

function readPageProductCards() {
  const cards = new Map<string, {
    price?: string
    compareAtPrice?: string
    rating?: number
    color?: string
    fit?: string
    badges?: string[]
  }>()

  const productGrid = document.querySelector<HTMLElement>("[data-comp='product-grid'], [data-section-key='product-grid'], section[id*='Product Grid' i]")
  const cardRoot = productGrid || document
  cardRoot.querySelectorAll<HTMLElement>("article[data-testid^='plp-productCard-'], [data-cnstrc-item-id], [data-cnstrc-item-price]").forEach((card) => {
    addPageProductCard(cards, card)
  })
  cardRoot.querySelectorAll<HTMLAnchorElement>("a[href*='/products/']").forEach((link) => {
    const card = findProductCard(link)
    if (card) addPageProductCard(cards, card)
  })
  return cards
}

function readCardPrice(card: HTMLElement, selector: string) {
  const fallbackSelectors = selector.includes("compareAt")
    ? [selector, ".price-item--regular", ".compare-at-price", "[class*='compare'][class*='price']", "del"]
    : [selector, ".price-item--sale", ".price-item--last", ".sale-price", ".price", "[class*='price']"]
  const text = fallbackSelectors.map((candidate) => card.querySelector(candidate)?.textContent).find(Boolean)?.replace(/\s+/g, " ").trim()
  return text?.match(/[$£€]\s?\d+(?:[,.]\d{1,2})?/)?.[0]
}

function findProductCard(link: HTMLAnchorElement) {
  return link.closest<HTMLElement>("article, li, [data-product-handle], [data-product-id], [data-cnstrc-item-id], [data-cnstrc-item-price], [class*='product-card' i], [class*='product-item' i], [class*='product__' i], [class*='grid__item' i]")
}

function addPageProductCard(cards: Map<string, {
  price?: string
  compareAtPrice?: string
  rating?: number
  color?: string
  fit?: string
  badges?: string[]
}>, card: HTMLElement) {
  const link = card.querySelector<HTMLAnchorElement>("a[href*='/products/']")
  const handle = link && new URL(link.href, location.origin).pathname.match(/\/products\/([^/]+)/)?.[1]
  if (!handle) return

  const price = readCardPrice(card, "[data-testid^='plp-totalValue-']") || readDataPrice(card)
  const compareAtPrice = readCardPrice(card, "[data-testid^='plp-compareAtValue-']")
  const ratingText = card.querySelector("[data-testid='star-rating'], [class*='rating'], [aria-label*='rating' i]")?.textContent
  const fit = card.querySelector("[data-testid^='plp-productFit-'], [class*='fit']")?.textContent?.trim()
  const color = card.querySelector("[data-testid^='plp-productColour-'], [class*='color'], [class*='colour']")?.textContent?.trim()
  const badges = [...card.querySelectorAll<HTMLElement>("[data-testid*='badge' i], [data-testid*='label' i], [class*='badge'], [class*='tag']")]
    .map((element) => element.textContent?.trim())
    .filter((value): value is string => Boolean(value) && value.length < 40)

  if (price || compareAtPrice || ratingText || color || fit || badges.length) {
    cards.set(handle, {
      price,
      compareAtPrice,
      rating: ratingText ? Number(ratingText.match(/\d+(?:\.\d+)?/)?.[0]) : undefined,
      color,
      fit,
      badges: badges.length ? [...new Set(badges)] : undefined
    })
  }
}

function readDataPrice(card: HTMLElement) {
  const value = card.getAttribute("data-cnstrc-item-price") || card.getAttribute("data-price") || card.getAttribute("data-product-price")
  if (!value) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : value.match(/[$£€]\s?\d+(?:[,.]\d{1,2})?/)?.[0]
}

function getCollectionEndpoints(sortQuery: string) {
  const handle = location.pathname.match(/^\/collections\/([^/]+)/)?.[1]
  if (!handle) return []
  const collectionPath = `/collections/${handle}/products.json`
  return [`${collectionPath}?sort_by=${sortQuery}&limit=250`, `${collectionPath}?limit=250`]
}