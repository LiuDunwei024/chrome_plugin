/// <reference types="chrome" />

type ShopifyStatus = {
  isShopify: boolean
  url?: string
  hostname?: string
  signals?: string[]
}

type ExtensionMessage =
  | { type: "SHOPIFY_DETECTED"; status: ShopifyStatus }
  | { type: "GET_ACTIVE_TAB_STATUS" }
  | { type: "GET_SHOPIFY_STATUS" }

const statuses = new Map<number, ShopifyStatus>()

const log = (...args: unknown[]) =>
  console.info("[Competitor Analysis background]", ...args)

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === "SHOPIFY_DETECTED" && sender.tab?.id !== undefined) {
      statuses.set(sender.tab.id, message.status)
      log("Shopify status received", sender.tab.id, message.status)
      sendResponse({ ok: true })
      return
    }

    if (message.type === "GET_SHOPIFY_STATUS") {
      const tabId = sender.tab?.id
      sendResponse(tabId === undefined ? { isShopify: false } : statuses.get(tabId))
      return
    }

    if (message.type === "GET_ACTIVE_TAB_STATUS") {
      void getActiveTabStatus().then(sendResponse)
      return true
    }
  }
)

chrome.tabs.onRemoved.addListener((tabId) => {
  statuses.delete(tabId)
})

async function getActiveTabStatus(): Promise<ShopifyStatus> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tab?.id === undefined) {
    log("No active tab found")
    return { isShopify: false }
  }

  try {
    const status = await chrome.tabs.sendMessage<
      { type: "GET_SHOPIFY_STATUS" },
      ShopifyStatus
    >(tab.id, { type: "GET_SHOPIFY_STATUS" })

    if (status) {
      statuses.set(tab.id, status)
      log("Active tab status returned", tab.id, status)
      return status
    }
  } catch {
    // The active tab may not allow content scripts, such as a browser page.
    log("Unable to reach Content Script", tab.id, tab.url)
  }

  return statuses.get(tab.id) ?? {
    isShopify: false,
    url: tab.url,
    hostname: tab.url ? new URL(tab.url).hostname : undefined
  }
}