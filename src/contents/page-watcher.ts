type PageChangeCallback = (reason: "dom" | "navigation") => void

export function watchPageUpdates(
  getIgnoredRoot: () => HTMLElement | undefined,
  onChange: PageChangeCallback
) {
  let lastUrl = location.href
  let timer: number | undefined

  const scheduleChange = (reason: PageChangeCallback extends (reason: infer R) => void ? R : never) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => onChange(reason), 500)
  }

  const observer = new MutationObserver((mutations) => {
    const hasPageMutation = mutations.some((mutation) => {
      const target = mutation.target
      const ignoredRoot = getIgnoredRoot()
      if (!ignoredRoot) return true
      if (target === ignoredRoot || ignoredRoot.contains(target)) return false

      return [...mutation.addedNodes, ...mutation.removedNodes].some(
        (node) => node === ignoredRoot || ignoredRoot.contains(node)
      )
        ? false
        : true
    })

    if (hasPageMutation) scheduleChange("dom")
  })

  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener("popstate", () => scheduleChange("navigation"))
  window.addEventListener("hashchange", () => scheduleChange("navigation"))

  const urlTimer = window.setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      scheduleChange("navigation")
    }
  }, 500)

  return () => {
    observer.disconnect()
    window.clearTimeout(timer)
    window.clearInterval(urlTimer)
  }
}