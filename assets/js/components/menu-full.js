import { supabase } from '../supabase-client.js'
import { escapeHtml } from '../utils.js'

const SVG_MAP = {
  'Cold Starters': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
  'Hot Starters': '<path d="M12 2c0 4-4 5-4 9a4 4 0 008 0c0-4-4-5-4-9z"/>',
  'Fresh Salads': '<path d="M12 22V12M12 12C12 7 6 4 3 7M12 12C12 7 18 4 21 7"/>',
  'Assorted Platters': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  'Sandwiches': '<path d="M3 8h18M3 16h18M5 8v8M19 8v8"/>',
  'Platter Meals': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  'El Arabi Experience': '<path d="M12 3L3 9v12h6v-7h6v7h6V9z"/>',
  'Chawarma by Weight': '<path d="M3 6h18M6 6V4h12v2M5 20h14l1-14H4z"/>',
  'Fire Grills': '<path d="M4 12h16M4 12a8 8 0 0016 0M9 12V8M15 12V8"/>',
  'Premium Smoked Meats': '<path d="M8 3c0 3-3 4-3 7s3 4 3 7M12 3c0 3-3 4-3 7s3 4 3 7M16 3c0 3-3 4-3 7s3 4 3 7"/>',
  'Oriental Cuisine': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'Family Dishes': '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  'Fresh Juices': '<path d="M8 2h8l1 6H7zM7 8c0 8 2 12 5 12s5-4 5-12"/>',
  'Syrian Desserts': '<path d="M12 2a5 5 0 015 5c0 3-5 8-5 8S7 10 7 7a5 5 0 015-5z"/><path d="M5 20h14"/>',
  'Beverages': '<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
}

const EYEBROW_MAP = {
  'Cold Starters': 'To Begin',
  'Hot Starters': 'Warm & Golden',
  'Fresh Salads': 'Garden Fresh',
  'Assorted Platters': 'Sharing & Tasting',
  'Sandwiches': 'Street Heritage',
  'Platter Meals': 'Main Course',
  'El Arabi Experience': 'Authentic Flavours',
  'Chawarma by Weight': 'Premium Selection',
  'Fire Grills': 'Fire & Smoke',
  'Premium Smoked Meats': 'Slow & Low',
  'Oriental Cuisine': 'From the East',
  'Family Dishes': 'Celebrate Together',
  'Fresh Juices': 'Pressed Fresh Daily',
  'Syrian Desserts': 'Sweet Endings',
  'Beverages': 'To Accompany',
}

function sectionId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function initMenuFull() {
  const main = document.querySelector('.main')
  if (!main) return

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) return

    const filtered = data.filter(item => item.section && item.section !== 'home')
    if (filtered.length === 0) return

    const groups = {}
    for (const item of filtered) {
      const s = item.section
      if (!groups[s]) groups[s] = []
      groups[s].push(item)
    }

    const sectionNames = Object.keys(groups)
    let sidebarHtml = ''
    let sectionsHtml = ''
    let isFirst = true

    for (const name of sectionNames) {
      const id = sectionId(name)
      const items = groups[name]
      const displayType = items[0].display_type || 'card'
      const eyebrow = EYEBROW_MAP[name] || ''
      const svgPath = SVG_MAP[name] || ''

      sidebarHtml += `
        <li class="nav-item">
          <button class="nav-btn${isFirst ? ' active' : ''}" data-section-target="${id}">
            ${svgPath ? `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${svgPath}</svg>` : ''}
            ${escapeHtml(name)}
          </button>
        </li>`

      let gridItems = ''
      if (displayType === 'list') {
        gridItems = items.map((item, idx) => `
          <div class="list-item">
            ${item.image_url ? `<div class="list-img"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>` : ''}
            <div class="list-info">
              <div class="list-name">${escapeHtml(item.name)}</div>
              ${item.description ? `<span class="list-desc">${escapeHtml(item.description)}</span>` : ''}
            </div>
            <div class="list-dots"></div>
            <div class="list-price">${escapeHtml(item.price)}</div>
          </div>`).join('')
      } else {
        gridItems = items.map((item, idx) => `
          <div class="item-card">
            ${item.image_url ? `<div class="item-card-img"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>` : ''}
            <div class="item-number">${String(idx + 1).padStart(2, '0')}</div>
            <div class="item-header">
              <div class="item-name">${escapeHtml(item.name)}</div>
              <div class="item-price">${escapeHtml(item.price)}</div>
            </div>
            ${item.description ? `<div class="item-divider"></div><p class="item-desc">${escapeHtml(item.description)}</p>` : ''}
          </div>`).join('')
      }

      sectionsHtml += `
        <section class="menu-section${isFirst ? ' active' : ''}" id="${id}">
          <div class="section-header">
            ${eyebrow ? `<p class="section-eyebrow">${eyebrow}</p>` : ''}
            <h2 class="section-title">${escapeHtml(name)}</h2>
            <div class="section-ornament"><div class="s-line"></div><div class="s-dot"></div><div class="s-line"></div></div>
          </div>
          <div class="${displayType === 'list' ? 'menu-list' : 'menu-grid'}">${gridItems}</div>
        </section>`

      isFirst = false
    }

    const navList = document.querySelector('.nav-list')
    if (navList) navList.innerHTML = sidebarHtml

    const mainEl = document.querySelector('.main')
    const existingSections = mainEl.querySelectorAll('.menu-section')
    existingSections.forEach(s => s.remove())

    const sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      const brandEyebrow = sidebar.querySelector('.brand-eyebrow')
      if (brandEyebrow) brandEyebrow.textContent = 'Tangier · Syrian Cuisine'
    }

    mainEl.insertAdjacentHTML('beforeend', sectionsHtml)

    document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'))
    const firstSection = document.querySelector('.menu-section')
    if (firstSection) firstSection.classList.add('active')

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
    const firstBtn = document.querySelector('.nav-btn')
    if (firstBtn) firstBtn.classList.add('active')
  } catch (err) {
    console.warn('Menu dynamique indisponible, utilisation du menu statique.', err.message)
  }
}


