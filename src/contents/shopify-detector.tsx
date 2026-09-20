/// <reference types="chrome" />

import { createRoot, type Root } from "react-dom/client"
import { ShopifyDrawer } from "./ShopifyDrawer"
import { drawerStyles } from "./drawer-styles"
import { watchPageUpdates } from "./page-watcher"
import { checkLoginStatus, detectShopify } from "./site-profile"
import type { ShopifyStatus } from "./types"

type ContentMessage = { type: "GET_SHOPIFY_STATUS" }

export const config = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

let currentStatus: ShopifyStatus
let drawerHost: HTMLDivElement | undefined
let drawerRoot: Root | undefined
let pageVersion = 0

const log = (...args: unknown[]) => console.info("[Competitor Analysis]", ...args)

function createDrawerEntry(status: ShopifyStatus) {
  if (drawerHost) {
    log("Drawer already mounted", status)
    return
  }

  drawerHost = document.createElement("div")
  drawerHost.id = "competitor-analysis-drawer-host"
  drawerHost.style.position = "fixed"
  drawerHost.style.inset = "0 0 0 auto"
  drawerHost.style.zIndex = "2147483647"
  drawerHost.style.pointerEvents = "none"

  const shadowRoot = drawerHost.attachShadow({ mode: "closed" })
  const style = document.createElement("style")
  style.textContent = drawerStyles
  const mountPoint = document.createElement("div")
  mountPoint.id = "competitor-analysis-drawer-root"
  shadowRoot.append(style, mountPoint)
  document.documentElement.append(drawerHost)
  drawerRoot = createRoot(mountPoint)
  drawerRoot.render(<ShopifyDrawer status={status} pageVersion={pageVersion} />)
}

async function refreshPage() {
  const nextStatus = await checkLoginStatus(detectShopify())
  currentStatus = nextStatus
  pageVersion += 1

  if (!nextStatus.isShopify) {
    drawerRoot?.unmount()
    drawerRoot = undefined
    drawerHost?.remove()
    drawerHost = undefined
  } else if (!drawerHost) {
    createDrawerEntry(nextStatus)
  } else {
    drawerRoot?.render(<ShopifyDrawer status={nextStatus} pageVersion={pageVersion} />)
  }

  void chrome.runtime.sendMessage({ type: "SHOPIFY_DETECTED", status: nextStatus })
}

async function initialize() {
  currentStatus = await checkLoginStatus(detectShopify())
  log("Content Script loaded", currentStatus)
  createDrawerEntry(currentStatus)
  void chrome.runtime.sendMessage({ type: "SHOPIFY_DETECTED", status: currentStatus })
  watchPageUpdates(() => drawerHost, (reason) => {
    log("Page updated; refreshing", reason)
    void refreshPage()
  })
}

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  if (message.type === "GET_SHOPIFY_STATUS") sendResponse(currentStatus)
})

void initialize()