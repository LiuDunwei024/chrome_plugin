import { useEffect, useState } from "react"
import { AlertCircle, Download, ExternalLink, ImageIcon, Package, RefreshCw, Search, SearchX, Star, X } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { downloadProductsCsv } from "./csv-export"
import { fetchProducts } from "./product-extractor"
import { hasSalesData, sortProducts, type ProductSortMode } from "./product-sorting"
import type { ShopifyProduct, ShopifyStatus } from "./types"

function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images?.[0]
  const prices = product.variants?.map((variant) => Number.parseFloat(variant.price ?? "")).filter(Number.isFinite) ?? []
  const price = prices.length > 0 ? `${Math.min(...prices)}${Math.max(...prices) !== Math.min(...prices) ? ` - ${Math.max(...prices)}` : ""}` : ""
  const description = stripHtml(product.description || product.body_html || "")
  const tags = Array.isArray(product.tags) ? product.tags : product.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? []
  const displayPrice = product.page_price || price

  return (
    <a className="product-card" href={`/products/${product.handle}`} target="_blank" rel="noreferrer">
      {image?.src ? <img src={image.src} alt={image.alt || product.title} loading="lazy" /> : <div className="image-placeholder">No image</div>}
      <div className="product-info">
        <div className="product-title-row">
          <h3>{product.title}</h3>
          <ExternalLink className="product-link-icon" aria-hidden="true" />
        </div>
        <div className="product-meta">
          <span>{product.vendor || product.product_type || "Shopify product"}</span>
          {displayPrice ? <strong>{displayPrice}</strong> : <span className="muted">No price</span>}
        </div>
        <div className="product-details">
          <span><Package aria-hidden="true" />{product.variants?.length ?? 0} variants</span>
          <span><ImageIcon aria-hidden="true" />{product.images?.length ?? 0} images</span>
          {product.rating ? <span><Star aria-hidden="true" />{product.rating}</span> : null}
        </div>
        {description ? <p className="product-description">{description}</p> : null}
        {tags.length > 0 ? <div className="product-tags">{tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div> : null}
      </div>
    </a>
  )
}

export function ShopifyDrawer({ status, pageVersion }: { status: ShopifyStatus; pageVersion: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [serverSortedMode, setServerSortedMode] = useState<ProductSortMode>()
  const [sortMode, setSortMode] = useState<ProductSortMode>("best-selling")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const sortedProducts = sortProducts(products, sortMode)
  const visibleProducts = sortedProducts.filter((product) => {
    const query = search.trim().toLowerCase()
    return !query || `${product.title} ${product.handle} ${product.vendor || ""}`.toLowerCase().includes(query)
  })

  function changeSortMode(mode: ProductSortMode) {
    setError(null)
    setSortMode(mode)
  }

  useEffect(() => {
    if (!isOpen || !status.isShopify || status.loginStatus === "unknown") return
    const controller = new AbortController()
    setProducts([])
    setServerSortedMode(undefined)
    setError(null)
    setIsLoading(true)
    fetchProducts(controller.signal, sortMode)
      .then(({ products: loadedProducts, serverSortedMode: loadedServerSortedMode }) => {
        setProducts(loadedProducts)
        setServerSortedMode(loadedServerSortedMode)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "Unable to load products")
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [isOpen, pageVersion, retryToken, sortMode, status.isShopify, status.loginStatus])

  return (
    <>
      <Button className="entry" type="button" aria-label="Open competitor analysis" onClick={() => setIsOpen(true)}><Package aria-hidden="true" />Analyze store</Button>
      <aside className={`drawer${isOpen ? " open" : ""}`} aria-label="Competitor analysis drawer">
        <header className="drawer-header">
          <div className="brand-mark"><Package aria-hidden="true" /></div>
          <div className="header-copy"><span className="eyebrow">Competitor intelligence</span><h2>{status.isShopify ? "Store catalog" : "Site check"}</h2><p>{status.hostname}</p></div>
          <Button variant="ghost" size="icon" className="close" type="button" aria-label="Close competitor analysis" onClick={() => setIsOpen(false)}><X aria-hidden="true" /></Button>
        </header>
        {!status.isShopify ? <NonShopifyState /> : null}
        {status.isShopify && status.loginStatus === "unknown" ? <p className="state">Checking storefront access...</p> : null}
        {status.isShopify ? <>
        <div className="catalog-summary">
          <div><span className="summary-label">Products</span><strong>{products.length.toLocaleString()}</strong><span className="summary-caption">indexed</span></div>
          <div><span className="summary-label">Assets</span><strong>{products.reduce((count, product) => count + (product.images?.length ?? 0), 0).toLocaleString()}</strong><span className="summary-caption">images</span></div>
          <div><span className="summary-label">Store</span><strong>{status.themeName || "Shopify"}</strong><span className="summary-caption">platform</span></div>
        </div>
        <div className="catalog-toolbar">
          <label className="search-field"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search catalog..." aria-label="Search catalog" /></label>
          <div className="sort-controls" role="group" aria-label="Sort products">
            <Button variant={sortMode === "best-selling" ? "secondary" : "ghost"} size="sm" type="button" onClick={() => changeSortMode("best-selling")}>Best-selling</Button>
            <Button variant={sortMode === "newest" ? "secondary" : "ghost"} size="sm" type="button" onClick={() => changeSortMode("newest")}>Newest</Button>
          </div>
        </div>
        <Button
          className="export-button"
          type="button"
          disabled={isLoading || products.length === 0}
          onClick={() => downloadProductsCsv(sortedProducts, status.hostname)}><Download aria-hidden="true" />Export CSV <span>{sortedProducts.length.toLocaleString()}</span>
        </Button>
        {sortMode === "best-selling" && products.length > 0 && !hasSalesData(products) && serverSortedMode !== "best-selling" ? (
          <p className="sort-note">Sales data unavailable; showing the store order.</p>
        ) : null}
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} onRetry={() => setRetryToken((token) => token + 1)} /> : null}
        {!isLoading && !error && products.length === 0 ? <EmptyState searchActive={false} onClearSearch={() => setSearch("")} /> : null}
        {!isLoading && !error && products.length > 0 ? <p className="results-label">Showing {visibleProducts.length.toLocaleString()} of {products.length.toLocaleString()} products</p> : null}
        {!isLoading && !error && products.length > 0 && visibleProducts.length === 0 ? <EmptyState searchActive onClearSearch={() => setSearch("")} /> : null}
        {!isLoading && !error && visibleProducts.length > 0 ? <div className="product-list">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : null}
        </> : null}
      </aside>
    </>
  )
}

function stripHtml(value: string) {
  const element = document.createElement("div")
  element.innerHTML = value
  return (element.textContent || "").replace(/\s+/g, " ").trim()
}

function ProductSkeleton() {
  return <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton skeleton-image" />
    <div className="skeleton-copy"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-meta" /><div className="skeleton skeleton-detail" /></div>
  </div>
}

function LoadingState() {
  return <div className="loading-state" role="status" aria-label="Loading products">
    <div className="loading-heading"><span className="loading-dot" />Syncing store catalog</div>
    <ProductSkeleton />
    <ProductSkeleton />
    <ProductSkeleton />
  </div>
}

function EmptyState({ searchActive, onClearSearch }: { searchActive: boolean; onClearSearch: () => void }) {
  return <div className="empty-state">
    <div className="empty-icon"><SearchX aria-hidden="true" /></div>
    <strong>{searchActive ? "No matching products" : "No products found"}</strong>
    <p>{searchActive ? "Try a different product name or handle." : "This store did not return a public product catalog."}</p>
    {searchActive ? <Button variant="outline" size="sm" onClick={onClearSearch}>Clear search</Button> : null}
  </div>
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="error-state" role="alert">
    <div className="error-icon"><AlertCircle aria-hidden="true" /></div>
    <strong>Catalog sync failed</strong>
    <p>{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw aria-hidden="true" />Retry</Button>
  </div>
}

function NonShopifyState() {
  return <div className="unsupported-state">
    <div className="unsupported-icon"><Package aria-hidden="true" /></div>
    <strong>Shopify store required</strong>
    <p>This page is not a Shopify storefront, so a product catalog cannot be analyzed here.</p>
    <span>Open a Shopify storefront to start analyzing products.</span>
  </div>
}