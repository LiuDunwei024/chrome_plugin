import { useEffect, useState } from "react"

type ShopifyStatus = {
  isShopify: boolean
  hostname?: string
  signals?: string[]
}

function IndexPopup() {
  const [status, setStatus] = useState<ShopifyStatus | null>(null)

  useEffect(() => {
    chrome.runtime
      .sendMessage({ type: "GET_ACTIVE_TAB_STATUS" })
      .then(setStatus)
      .catch(() => setStatus({ isShopify: false }))
  }, [])

  return (
    <div
      style={{
        minWidth: 280,
        padding: 16
      }}>
      <h2>Competitor analysis</h2>
      <p>
        {status === null
          ? "Checking current page..."
          : status.isShopify
            ? `Shopify detected: ${status.hostname}`
            : "This page does not appear to be a Shopify store."}
      </p>
    </div>
  )
}

export default IndexPopup