# Implementation Plan

[Overview]
Implement a "Pack Builder" system for IbizaDay's catalog page that lets users add items to a custom experience pack and see the running total in a floating panel.

The IbizaDay catalog (`catalogo.html`) currently displays three categories of items — Espacios (spaces), Servicios (services), and Amenities y Extras — as static cards with prices. Users have no way to compose a custom experience from these items. This feature adds an "Add to Pack" button to every card, a floating summary bar at the bottom of the screen showing the pack total, and an expandable drawer listing all selected items. The final CTA sends the user to the contact page with their pack details pre-filled via sessionStorage. Prices are currently stored as display strings; we will add `data-price` numeric attributes to each card for clean calculation, while keeping the existing display text unchanged.

[Types]
No formal type system exists (vanilla JS/HTML project); data structures are plain JS objects stored in sessionStorage.

Pack item object structure (plain JS):
```
{
  id: String,          // unique slug e.g. "espacio-villa-cas-mut"
  category: String,    // "espacio" | "servicio" | "amenity" | "pack"
  name: String,        // display name e.g. "Villa Cas Mut"
  price: Number,       // numeric base price e.g. 2500
  priceLabel: String,  // display string e.g. "desde 2.500 € / dia"
  unit: String         // price unit e.g. "/ dia" | "/ pp" | ""
}
```

Pack state object (stored in sessionStorage under key `ibizaday_pack`):
```
{
  items: Array<PackItem>
}
```

[Files]
Three existing files are modified; no new files are created.

- **`catalogo.html`** (MODIFY):
  - Add `data-price`, `data-name`, `data-category`, `data-id` attributes to every card article element
  - Add `<button class="btn-add-pack">+ Añadir al pack</button>` inside each card's content area
  - Add the Pack Summary Bar HTML structure at the bottom of `<body>`, before the closing `</body>` tag
  - Add the Pack Drawer HTML structure (hidden by default) also before `</body>`

- **`styles.css`** (MODIFY):
  - Add styles for `.btn-add-pack` (button on each card)
  - Add styles for `.btn-add-pack.is-added` state (visual feedback when item is in pack)
  - Add styles for `.pack-bar` (floating bottom bar)
  - Add styles for `.pack-bar.is-visible` (shown when pack has items)
  - Add styles for `.pack-drawer` (expandable panel)
  - Add styles for `.pack-drawer.is-open` state
  - Add styles for `.pack-drawer-item` (individual item row in drawer)
  - Add styles for `.pack-drawer-total` (total price display)
  - Add styles for `.pack-drawer-cta` (contact button)

- **`main.js`** (MODIFY):
  - Add Pack Builder IIFE module at the end of the file
  - Handles: init from sessionStorage, add/remove items, price calculation, UI updates, contact page handoff

[Functions]
All new functions live inside a single IIFE in `main.js`.

New functions to add inside the Pack Builder IIFE:

- `loadPack()` → reads `ibizaday_pack` from sessionStorage, returns parsed object or `{ items: [] }`
- `savePack(pack)` → serializes pack object to sessionStorage
- `addItem(itemData)` → adds item to pack if not already present, saves, updates UI
- `removeItem(itemId)` → removes item by id from pack, saves, updates UI
- `toggleItem(itemData)` → calls addItem or removeItem based on current state
- `calculateTotal(pack)` → sums all item prices, returns Number
- `formatPrice(number)` → formats number to locale string e.g. `2500` → `"2.500"`, returns String
- `updateBar(pack)` → updates the floating bar count and total price, shows/hides bar
- `updateDrawer(pack)` → re-renders the drawer item list
- `updateCardButtons(pack)` → syncs all `.btn-add-pack` button states with current pack
- `openDrawer()` → adds `.is-open` to `.pack-drawer`, traps focus
- `closeDrawer()` → removes `.is-open` from `.pack-drawer`, restores focus
- `initPackBuilder()` → entry point: reads DOM cards, attaches event listeners, calls updateBar/updateCardButtons

[Classes]
No class-based architecture; this is a vanilla JS project using IIFEs and DOM manipulation.

CSS classes added (not JS classes):
- `.btn-add-pack` — the add button on each card
- `.btn-add-pack.is-added` — state when item is already in pack (shows "✓ En el pack")
- `.pack-bar` — the fixed bottom summary bar
- `.pack-bar.is-visible` — shown when pack.items.length > 0
- `.pack-drawer` — the slide-up panel with full pack details
- `.pack-drawer.is-open` — visible state
- `.pack-drawer-overlay` — semi-transparent backdrop behind drawer
- `.pack-drawer-header` — drawer title + close button
- `.pack-drawer-list` — scrollable list of pack items
- `.pack-drawer-item` — single item row (name, price, remove button)
- `.pack-drawer-footer` — total + CTA area

[Dependencies]
No new dependencies required. The implementation uses only vanilla JavaScript and CSS, consistent with the existing codebase which has no build system, no npm, and no framework.

[Testing]
Manual browser testing only (no test framework exists in this project).

Validation checklist:
- Add an item from each category (espacio, servicio, amenity, pack) → bar appears with correct count and total
- Add same item twice → only appears once (deduplication)
- Remove item from drawer → item removed, total updates, bar hides if empty
- Refresh page → pack persists via sessionStorage
- Switch catalog tabs → pack state preserved, button states correct on new tab
- Click "Solicitar este pack" → navigates to contacto.html, pack data available in sessionStorage
- Mobile (360px) → bar and drawer are usable, no overflow
- Keyboard navigation → drawer can be opened/closed with keyboard, focus trapped in drawer

[Implementation Order]
Implement in this sequence to avoid broken intermediate states.

1. Add `data-price`, `data-name`, `data-category`, `data-id` attributes to all cards in `catalogo.html`
2. Add `.btn-add-pack` button HTML inside each card in `catalogo.html`
3. Add Pack Bar and Pack Drawer HTML structures at bottom of `catalogo.html` body
4. Add all CSS for `.btn-add-pack`, `.pack-bar`, `.pack-drawer` and related classes to `styles.css`
5. Add Pack Builder JavaScript IIFE to `main.js` (all functions: load, save, add, remove, toggle, calculate, format, updateBar, updateDrawer, updateCardButtons, openDrawer, closeDrawer, init)
6. Add sessionStorage handoff logic so `contacto.html` can read pack data (add a small reader snippet to `contacto.html` that pre-populates the message field with pack summary)
