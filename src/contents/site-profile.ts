import type { ShopifyStatus } from "./types"

type ShopifyGlobal = { theme?: { name?: unknown } }
const appSignatures = [
  ["Judge.me", ["judge.me", "judgeme", "jdgm"]],
  ["Loox", ["loox"]],
  ["Klaviyo", ["klaviyo"]],
  ["Yotpo", ["yotpo"]],
  ["Gorgias", ["gorgias"]],
  ["ReCharge", ["recharge"]],
  ["Privy", ["privy"]]
] as const

export function detectShopify(): ShopifyStatus {
  const pageText = document.documentElement?.innerHTML ?? ""
  const shopifyWindow = (window as Window & { Shopify?: unknown }).Shopify
  const signals: string[] = []
  const profile = extractSiteProfile(shopifyWindow, pageText)

  if (shopifyWindow) signals.push("window.Shopify")
  if (document.querySelector('meta[name="generator"][content*="Shopify" i]')) signals.push("generator meta")
  if (document.querySelector('script[src*="cdn.shopify.com"], link[href*="cdn.shopify.com"], script[src*="shopifycloud.com"]')) signals.push("Shopify CDN")
  if (document.cookie.includes("_shopify_y=") || document.cookie.includes("_shopify_s=")) signals.push("Shopify cookie")
  if (pageText.includes("Shopify.theme") || pageText.includes("Shopify.routes")) signals.push("Shopify page data")

  return {
    isShopify: signals.length > 0,
    url: location.href,
    hostname: location.hostname,
    signals,
    loginStatus: "unknown",
    loginUrl: new URL("/account/login", location.origin).href,
    ...profile
  }
}

export async function checkLoginStatus(status: ShopifyStatus): Promise<ShopifyStatus> {
  if (!status.isShopify) return status

  const pageText = document.documentElement?.innerHTML ?? ""
  const shopifyWindow = (window as Window & { Shopify?: { customer?: unknown } }).Shopify
  const hasCustomerMarker = Boolean(
    shopifyWindow?.customer ||
      document.querySelector('a[href*="/account/logout"], [data-customer-id], [data-customer-email]')
  )

  if (hasCustomerMarker) return { ...status, loginStatus: "logged-in" }

  try {
    const response = await fetch(new URL("/account", location.origin), {
      credentials: "include",
      redirect: "follow",
      headers: { Accept: "text/html" }
    })
    const finalPath = new URL(response.url).pathname
    const accountHtml = await response.text()
    const isLoginPage = finalPath.includes("/account/login") ||
      /name=["']customer\[email\]["']|action=["'][^"']*account\/login/i.test(accountHtml)
    const isAccountPage = /logout|customer_email|customer_name|account-details/i.test(accountHtml)

    return {
      ...status,
      loginStatus: isLoginPage ? "logged-out" : isAccountPage ? "logged-in" : "unknown"
    }
  } catch {
    return { ...status, loginStatus: "unknown" }
  }
}

export function extractSiteProfile(shopifyWindow: unknown, pageText: string) {
  const scripts = [...document.scripts].map((script) => `${script.src}\n${script.textContent ?? ""}`).join("\n")
  const searchableText = `${pageText}\n${scripts}`.toLowerCase()
  const apps = appSignatures.filter(([, patterns]) => patterns.some((pattern) => searchableText.includes(pattern))).map(([name]) => name)
  return { themeName: readThemeName(shopifyWindow, scripts), apps }
}

function readThemeName(shopifyWindow: unknown, scripts: string) {
  const theme = typeof shopifyWindow === "object" && shopifyWindow !== null ? (shopifyWindow as ShopifyGlobal).theme?.name : undefined
  if (typeof theme === "string" && theme.trim()) return theme.trim()
  return scripts.match(/Shopify\.theme\s*=\s*[\s\S]{0,500}?name\s*[:=]\s*["']([^"']+)["']/i)?.[1]?.trim()
}