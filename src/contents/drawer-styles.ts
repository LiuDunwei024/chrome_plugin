export const drawerStyles = `
  :host { all: initial; }
  .entry { position: fixed; top: 50%; right: 0; transform: translateY(-50%); pointer-events: auto; border: 0; border-radius: 8px 0 0 8px; padding: 12px 9px; background: #111827; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,.2); cursor: pointer; font: 600 13px/1.2 system-ui, sans-serif; writing-mode: vertical-rl; }
  .entry:hover { background: #2563eb; }
  .drawer { position: fixed; top: 0; right: 0; width: min(380px, 90vw); height: 100vh; box-sizing: border-box; overflow-y: auto; padding: 24px; background: #f8fafc; color: #111827; box-shadow: -8px 0 32px rgba(0,0,0,.18); font: 14px/1.5 system-ui, sans-serif; transform: translateX(100%); transition: transform .2s ease; pointer-events: auto; }
  .drawer.open { transform: translateX(0); }
  .close { float: right; border: 0; background: transparent; color: #6b7280; font-size: 22px; cursor: pointer; }
  h2 { margin: 0 0 2px; font-size: 20px; }
  .subtitle { margin: 0 0 18px; color: #64748b; font-size: 12px; }
  .login-gate { display: grid; gap: 8px; margin: 0 0 18px; padding: 14px; border: 1px solid #bfdbfe; border-radius: 8px; background: #eff6ff; color: #1e3a8a; }
  .login-gate p { margin: 0; color: #475569; font-size: 12px; }
  .login-gate a { width: fit-content; border-radius: 6px; padding: 8px 10px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; }
  .site-profile { display: grid; gap: 8px; margin: 0 0 18px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
  .site-profile div { display: flex; justify-content: space-between; gap: 12px; }
  .profile-label { color: #64748b; }
  .site-profile strong { max-width: 230px; overflow: hidden; color: #0f172a; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
  .sort-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
  .sort-controls button { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 6px; background: #fff; color: #475569; cursor: pointer; font: 600 12px/1.2 system-ui, sans-serif; }
  .sort-controls button:hover { border-color: #60a5fa; color: #1d4ed8; }
  .sort-controls button.active { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
  .export-button { width: 100%; margin: 0 0 12px; border: 0; border-radius: 6px; padding: 9px 12px; background: #111827; color: #fff; cursor: pointer; font: 600 12px/1.2 system-ui, sans-serif; }
  .export-button:hover { background: #2563eb; }
  .export-button:disabled { background: #cbd5e1; cursor: not-allowed; }
  .sort-note { margin: 0 0 12px; color: #64748b; font-size: 11px; }
  .state { margin: 24px 0; color: #475569; }
  .error { color: #b91c1c; }
  .product-list { display: grid; gap: 12px; }
  .product-card { display: flex; gap: 12px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: inherit; text-decoration: none; }
  .product-card:hover { border-color: #93c5fd; box-shadow: 0 3px 10px rgba(15, 23, 42, .08); }
  .product-card img, .image-placeholder { width: 72px; height: 72px; flex: 0 0 72px; border-radius: 6px; object-fit: cover; background: #e2e8f0; }
  .image-placeholder { display: grid; place-items: center; color: #64748b; font-size: 11px; text-align: center; }
  .product-info { min-width: 0; }
  h3 { margin: 2px 0 10px; overflow: hidden; font-size: 14px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
  .product-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: #64748b; font-size: 12px; }
  .product-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .product-meta strong { color: #0f172a; white-space: nowrap; }
  .product-details { display: flex; flex-wrap: wrap; gap: 4px 8px; margin-top: 7px; color: #94a3b8; font-size: 11px; }
  .product-description { display: -webkit-box; margin: 7px 0 0; overflow: hidden; color: #64748b; font-size: 11px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .product-tags { margin: 5px 0 0; overflow: hidden; color: #2563eb; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

  * { box-sizing: border-box; }
  button, input { font: inherit; }
  .entry { display: inline-flex; align-items: center; gap: 7px; border-radius: 9px 0 0 9px; background: #172033; box-shadow: 0 10px 30px rgba(23,32,51,.22); font-size: 12px; font-weight: 700; }
  .entry svg { width: 15px; height: 15px; }
  .entry:hover { background: #3567e8; }
  .drawer { width: min(430px, 94vw); padding: 25px 20px 28px; background: #f5f7fb; color: #172033; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-shadow: -14px 0 40px rgba(23,32,51,.18); transition: transform .24s cubic-bezier(.22,1,.36,1); }
  .drawer-header { display: flex; align-items: flex-start; gap: 11px; margin-bottom: 22px; }
  .brand-mark { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border-radius: 10px; background: #172033; color: #fff; box-shadow: 0 5px 12px rgba(23,32,51,.16); }
  .brand-mark svg { width: 18px; height: 18px; }
  .header-copy { min-width: 0; flex: 1; }
  .eyebrow { display: block; margin: 1px 0 2px; color: #3567e8; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  h2 { margin: 0; color: #172033; font-size: 21px; font-weight: 750; letter-spacing: -.02em; line-height: 1.1; }
  .header-copy p { margin: 5px 0 0; overflow: hidden; color: #718096; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .close { float: none; width: 32px; height: 32px; padding: 0; border-radius: 8px; color: #8a96a8; font-size: 0; }
  .close:hover { background: #e9eef7; color: #172033; }
  .ui-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid transparent; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease; }
  .ui-button:active { transform: translateY(1px); }
  .ui-button:disabled { cursor: not-allowed; opacity: .52; }
  .ui-button-default { background: #172033; color: #fff; }
  .ui-button-default:hover { background: #3567e8; }
  .ui-button-secondary { border-color: #cfdbf4; background: #edf3ff; color: #2855c8; }
  .ui-button-secondary:hover { background: #e2ebff; }
  .ui-button-ghost { background: transparent; color: #718096; }
  .ui-button-ghost:hover { background: #e9eef7; color: #172033; }
  .ui-button-sm { min-height: 30px; padding: 0 10px; font-size: 11px; }
  .ui-button-default:not(.ui-button-sm) { min-height: 38px; padding: 0 13px; }
  .ui-button-icon { width: 32px; height: 32px; padding: 0; }
  .catalog-summary { display: grid; grid-template-columns: 1.05fr 1.05fr 1.25fr; gap: 1px; margin-bottom: 17px; overflow: hidden; border: 1px solid #e5eaf1; border-radius: 10px; background: #e5eaf1; }
  .catalog-summary > div { min-width: 0; padding: 12px 11px; background: #fff; }
  .summary-label, .summary-caption { display: block; color: #718096; font-size: 10px; }
  .catalog-summary strong { display: block; overflow: hidden; margin: 3px 0 1px; color: #172033; font-size: 17px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
  .summary-caption { color: #9aa6b7; }
  .catalog-toolbar { display: grid; gap: 9px; margin-bottom: 10px; }
  .search-field { display: flex; align-items: center; gap: 8px; height: 38px; border: 1px solid #e5eaf1; border-radius: 8px; padding: 0 11px; background: #fff; color: #91a0b3; }
  .search-field:focus-within { border-color: #96b1f2; box-shadow: 0 0 0 3px rgba(53,103,232,.1); }
  .search-field svg { width: 15px; height: 15px; }
  .search-field input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #172033; font-size: 12px; }
  .sort-controls { display: flex; gap: 5px; }
  .sort-controls .ui-button { flex: 1; }
  .export-button { display: flex; width: 100%; margin: 0 0 13px; }
  .export-button svg { width: 15px; height: 15px; }
  .export-button span { opacity: .7; font-weight: 600; }
  .results-label { margin: 2px 2px 9px; color: #718096; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .product-list { display: grid; gap: 8px; }
  .product-card { gap: 11px; padding: 10px; border: 1px solid #e5eaf1; border-radius: 10px; background: #fff; transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
  .product-card:hover { border-color: #b7c8ed; box-shadow: 0 5px 14px rgba(23,32,51,.08); transform: translateY(-1px); }
  .product-card img, .image-placeholder { width: 66px; height: 76px; flex-basis: 66px; border-radius: 7px; }
  .product-title-row { display: flex; align-items: flex-start; gap: 5px; }
  h3 { margin: 1px 0 5px; font-size: 12px; font-weight: 750; }
  .product-link-icon { width: 12px; height: 12px; flex: 0 0 12px; margin-top: 2px; color: #a3adbb; }
  .product-meta { font-size: 10px; }
  .product-meta strong { color: #16866a; font-size: 12px; font-weight: 800; }
  .product-details { margin-top: 8px; font-size: 10px; }
  .product-details span { display: inline-flex; align-items: center; gap: 3px; }
  .product-details svg { width: 11px; height: 11px; }
  .product-tags { display: flex; gap: 4px; margin-top: 7px; }
  .ui-badge { display: inline-flex; border-radius: 999px; padding: 2px 6px; background: #f0f3f8; color: #657287; font-size: 9px; font-weight: 700; line-height: 1.2; white-space: nowrap; }
  .loading-state { display: grid; gap: 8px; }
  .loading-heading { display: flex; align-items: center; gap: 7px; margin: 2px 2px 3px; color: #718096; font-size: 11px; font-weight: 700; }
  .loading-dot { width: 7px; height: 7px; border-radius: 50%; background: #3567e8; box-shadow: 0 0 0 4px #edf3ff; animation: pulse 1.2s ease-in-out infinite; }
  .skeleton-card { display: flex; gap: 11px; padding: 10px; border: 1px solid #e5eaf1; border-radius: 10px; background: #fff; }
  .skeleton { background: linear-gradient(100deg, #edf0f5 25%, #f8f9fb 40%, #edf0f5 55%); background-size: 250% 100%; animation: shimmer 1.4s ease-in-out infinite; }
  .skeleton-image { width: 66px; height: 76px; flex: 0 0 66px; border-radius: 7px; }
  .skeleton-copy { display: grid; align-content: start; gap: 9px; width: 100%; padding-top: 4px; }
  .skeleton-title { width: 78%; height: 10px; border-radius: 4px; }
  .skeleton-meta { width: 54%; height: 8px; border-radius: 4px; }
  .skeleton-detail { width: 65%; height: 8px; border-radius: 4px; }
  .empty-state, .error-state, .unsupported-state { display: grid; justify-items: center; margin: 18px 0; padding: 28px 18px; border: 1px dashed #d7dfeb; border-radius: 12px; background: rgba(255,255,255,.72); text-align: center; }
  .empty-icon, .error-icon, .unsupported-icon { display: grid; width: 40px; height: 40px; place-items: center; margin-bottom: 11px; border-radius: 12px; background: #edf3ff; color: #3567e8; }
  .error-icon { background: #fff0ef; color: #b42318; }
  .unsupported-icon { background: #f0f3f8; color: #657287; }
  .empty-icon svg, .error-icon svg, .unsupported-icon svg { width: 19px; height: 19px; }
  .empty-state strong, .error-state strong, .unsupported-state strong { color: #172033; font-size: 13px; }
  .empty-state p, .error-state p, .unsupported-state p { max-width: 260px; margin: 6px 0 13px; color: #718096; font-size: 11px; line-height: 1.55; }
  .unsupported-state span { color: #9aa6b7; font-size: 10px; }
  .error-state .ui-button svg { width: 13px; height: 13px; }
  @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
  @keyframes pulse { 0%, 100% { opacity: .45; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
  @media (max-width: 480px) { .drawer { width: 100vw; padding-right: 16px; padding-left: 16px; } }
`