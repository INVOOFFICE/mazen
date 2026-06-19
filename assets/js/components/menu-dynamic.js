import { supabase } from '../supabase-client.js'

export async function initMenuDynamic() {
  const container = document.querySelector('#panel-syrian .menu-grid')
  if (!container) return

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return

    const homeItems = data.filter(item => !item.section || item.section === 'home')
    if (homeItems.length === 0) return

    homeItems.sort((a, b) => {
      if (a.image_url && !b.image_url) return -1
      if (!a.image_url && b.image_url) return 1
      return 0
    })

    container.innerHTML = homeItems.slice(0, 6).map(item => `
      <div class="menu-card reveal">
        ${item.image_url ? `<div class="menu-card-img"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>` : ''}
        <div class="menu-card-cat">${escapeHtml(item.category)}</div>
        <div class="menu-card-name">${escapeHtml(item.name)}</div>
        <div class="menu-card-desc">${escapeHtml(item.description)}</div>
        <div class="menu-card-footer">
          <span class="menu-price">${escapeHtml(item.price)}</span>
          ${item.tag ? `<span class="menu-tag">${escapeHtml(item.tag)}</span>` : ''}
        </div>
      </div>
    `).join('')

    const { initReveal } = await import('./reveal.js')
    initReveal()
  } catch (err) {
    console.warn('Menu dynamique indisponible, utilisation du menu statique.', err.message)
  }
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
