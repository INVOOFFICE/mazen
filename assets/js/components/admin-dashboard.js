import { supabase } from '../supabase-client.js'
import { APP_CONFIG } from '../config/app-config.js'
import { escapeHtml } from '../utils.js'
const SUPABASE_URL = APP_CONFIG.supabase.url

let editingId = null

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = 'admin-login.html'
    return
  }

  initTabs()
  initMenuForm()
  initLogout()
  initSectionFilter()
  loadStats()
  await loadSectionOptions()
  loadMenuItems('home')
  loadReservations()
})

function initTabs() {
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      document.querySelectorAll('[data-tab]').forEach(l => l.classList.remove('active'))
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
      link.classList.add('active')
      const tab = link.dataset.tab
      document.getElementById(`tab-${tab}`).classList.add('active')
      document.getElementById('pageTitle').textContent = tab === 'menu' ? 'Gestion du Menu' : 'Gestion des Réservations'
      document.getElementById('pageSubtitle').textContent = tab === 'menu'
        ? 'Gère les plats affichés sur le site'
        : 'Consulte et gère les réservations clients'
    })
  })
}

function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = 'admin-login.html'
  })
}

function initMenuForm() {
  document.getElementById('saveItemBtn').addEventListener('click', saveMenuItem)
  document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit)
  document.getElementById('itemImage').addEventListener('change', (e) => {
    const file = e.target.files[0]
    const preview = document.getElementById('imagePreview')
    const label = document.getElementById('fileUploadLabel')
    if (file) {
      label.textContent = file.name
      const reader = new FileReader()
      reader.onload = (ev) => { preview.src = ev.target.result; preview.classList.remove('is-hidden') }
      reader.readAsDataURL(file)
    } else {
      preview.classList.add('is-hidden')
    }
  })
}

function initSectionFilter() {
  document.getElementById('sectionFilter').addEventListener('change', (e) => {
    loadMenuItems(e.target.value)
  })
}

async function loadSectionOptions() {
  try {
    const { data, error } = await supabase.from('menu_items').select('section')
    if (error) throw error
    const sections = [...new Set((data || []).map(d => d.section).filter(Boolean))]
    const sel = document.getElementById('sectionFilter')
    sections.sort().forEach(s => {
      const opt = document.createElement('option')
      opt.value = s
      opt.textContent = s
      sel.appendChild(opt)
    })
  } catch (err) {
    console.error('Erreur chargement sections:', err)
  }
}

async function loadStats() {
  try {
    const { data: menuData } = await supabase.from('menu_items').select('id')
    const { data: reservData } = await supabase.from('reservations').select('id,status')
    const menuCount = (menuData && menuData.length) || 0
    const reservCount = (reservData && reservData.length) || 0
    const pendingCount = (reservData && reservData.filter(r => r.status === 'pending').length) || 0

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${menuCount}</div>
        <div class="stat-label">Plats au menu</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${reservCount}</div>
        <div class="stat-label">Réservations totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${pendingCount}</div>
        <div class="stat-label">En attente</div>
      </div>
    `
  } catch (err) {
    console.error('Erreur chargement stats:', err)
  }
}

async function loadMenuItems(section) {
  const container = document.getElementById('menuTableBody')
  const isAll = section === 'all'
  try {
    let query = supabase.from('menu_items').select('*')
    if (!isAll && section !== 'home') {
      query = query.eq('section', section)
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    let items = data || []
    if (!isAll && section === 'home') {
      items = items.filter(item => !item.section || item.section === 'home')
    }

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          <p>Aucun plat pour le moment.</p>
        </div>`
      return
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Nom</th>
            ${isAll ? '<th>Section</th>' : ''}
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Tag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="" class="td-img">` : ''}</td>
              <td><strong>${escapeHtml(item.name)}</strong><br><span class="td-muted">${escapeHtml((item.description || '').substring(0, 50))}${(item.description || '').length > 50 ? '...' : ''}</span></td>
              ${isAll ? `<td>${escapeHtml(item.section || 'home')}</td>` : ''}
              <td>${escapeHtml(item.category)}</td>
              <td class="td-price">${escapeHtml(item.price)}</td>
              <td>${item.tag ? `<span class="td-tag">${escapeHtml(item.tag)}</span>` : '—'}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-edit" data-id="${item.id}">Modifier</button>
                  <button class="btn-delete" data-id="${item.id}">Supprimer</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editMenuItem(btn.dataset.id))
    })
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteMenuItem(btn.dataset.id))
    })
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="td-danger">Erreur de chargement : ${err.message}</p></div>`
  }
}

async function editMenuItem(id) {
  try {
    const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single()
    if (error) throw error
    if (!data) return

    editingId = id
    document.getElementById('menuFormTitle').textContent = 'Modifier le plat'
    document.getElementById('editId').value = id
    document.getElementById('itemName').value = data.name
    document.getElementById('itemCategory').value = data.category
    document.getElementById('itemPrice').value = data.price
    document.getElementById('itemTag').value = data.tag || ''
    document.getElementById('itemDesc').value = data.description
    document.getElementById('itemImageUrl').value = data.image_url || ''
    document.getElementById('fileUploadLabel').textContent = data.image_url ? 'Remplacer…' : 'Choisir un fichier'
    const preview = document.getElementById('imagePreview')
    if (data.image_url) {
      preview.src = data.image_url
      preview.classList.remove('is-hidden')
    } else {
      preview.classList.add('is-hidden')
    }
    document.getElementById('saveItemBtn').textContent = 'Enregistrer'
    document.getElementById('cancelEditBtn').classList.remove('is-hidden')
    document.getElementById('menuForm').scrollIntoView({ behavior: 'smooth' })
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error')
  }
}

function cancelEdit() {
  editingId = null
  document.getElementById('menuFormTitle').textContent = 'Ajouter un plat'
  document.getElementById('editId').value = ''
  document.getElementById('itemName').value = ''
  document.getElementById('itemCategory').value = ''
  document.getElementById('itemPrice').value = ''
  document.getElementById('itemTag').value = ''
  document.getElementById('itemDesc').value = ''
  document.getElementById('itemImage').value = ''
  document.getElementById('itemImageUrl').value = ''
  document.getElementById('imagePreview').classList.add('is-hidden')
  document.getElementById('fileUploadLabel').textContent = 'Choisir un fichier'
  document.getElementById('saveItemBtn').textContent = 'Ajouter'
  document.getElementById('cancelEditBtn').classList.add('is-hidden')
}

async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/menu-images/${fileName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'apikey': APP_CONFIG.supabase.anonKey,
      'Content-Type': file.type
    },
    body: file
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Upload failed: ${errText}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/menu-images/${fileName}`
}

async function saveMenuItem() {
  const name = document.getElementById('itemName').value.trim()
  const category = document.getElementById('itemCategory').value.trim()
  const price = document.getElementById('itemPrice').value.trim()
  const tag = document.getElementById('itemTag').value.trim()
  const description = document.getElementById('itemDesc').value.trim()

  if (!name || !category || !price || !description) {
    showToast('Veuillez remplir tous les champs obligatoires.', 'error')
    return
  }

  const fileInput = document.getElementById('itemImage')
  let imageUrl = document.getElementById('itemImageUrl').value

  if (fileInput.files.length > 0) {
    try {
      imageUrl = await uploadImage(fileInput.files[0])
    } catch (err) {
      showToast('Erreur upload photo : ' + err.message, 'error')
      return
    }
  }

  const payload = { name, category, price, description, tag: tag || null, image_url: imageUrl || null }

  try {
    if (editingId) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingId)
      if (error) throw error
      showToast('Plat modifié avec succès !', 'success')
      cancelEdit()
    } else {
      const { error } = await supabase.from('menu_items').insert(payload)
      if (error) throw error
      showToast('Plat ajouté avec succès !', 'success')
      document.getElementById('itemName').value = ''
      document.getElementById('itemCategory').value = ''
      document.getElementById('itemPrice').value = ''
      document.getElementById('itemTag').value = ''
      document.getElementById('itemDesc').value = ''
      document.getElementById('itemImage').value = ''
      document.getElementById('imagePreview').classList.add('is-hidden')
      document.getElementById('fileUploadLabel').textContent = 'Choisir un fichier'
    }
    const sel = document.getElementById('sectionFilter')
    loadMenuItems(sel.value)
    loadStats()
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error')
  }
}

async function deleteMenuItem(id) {
  const confirmed = await showConfirm('Supprimer ce plat ? Cette action est irréversible.')
  if (!confirmed) return

  try {
    const { data: item } = await supabase.from('menu_items').select('*').eq('id', id).single()
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) throw error

    if (item && item.image_url) {
      const key = item.image_url.split('/').pop()
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${SUPABASE_URL}/storage/v1/object/menu-images/${key}`, {
        method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'apikey': APP_CONFIG.supabase.anonKey,
    }
      }).catch(() => {})
    }

    showToast('Plat supprimé.', 'success')
    const sel = document.getElementById('sectionFilter')
    loadMenuItems(sel.value)
    loadStats()
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error')
  }
}

async function loadReservations() {
  const container = document.getElementById('reservationsTableBody')
  try {
    const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
    if (error) throw error

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>Aucune réservation pour le moment.</p>
        </div>`
      return
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Contact</th>
            <th>Branch</th>
            <th>Date</th>
            <th>Infos</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>
                ${escapeHtml(r.phone)}<br>
                <span class="td-muted">${escapeHtml(r.email)}</span>
              </td>
              <td>${escapeHtml(r.branch)}</td>
              <td>${r.date}<br><span class="td-muted">${r.time}</span></td>
              <td>
                ${r.guests}<br>
                ${r.special_requests ? `<span class="td-muted">📝 ${escapeHtml(r.special_requests)}</span>` : ''}
              </td>
              <td>
                <span class="status-badge ${r.status || 'pending'}">${escapeHtml(r.status || 'pending')}</span>
              </td>
              <td>
                <select class="status-select" data-id="${r.id}" data-current="${r.status || 'pending'}">
                  <option value="pending" ${(r.status || 'pending') === 'pending' ? 'selected' : ''}>En attente</option>
                  <option value="confirmed" ${r.status === 'confirmed' ? 'selected' : ''}>Confirmée</option>
                  <option value="cancelled" ${r.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`

    container.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', () => updateReservationStatus(sel.dataset.id, sel.value))
    })
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p class="td-danger">Erreur de chargement : ${err.message}</p></div>`
  }
}

async function updateReservationStatus(id, status) {
  try {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id)
    if (error) throw error
    showToast('Statut mis à jour !', 'success')
    loadReservations()
    loadStats()
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error')
    loadReservations()
  }
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal')
    const msg = document.getElementById('confirmMessage')
    const ok = document.getElementById('confirmOk')
    const cancel = document.getElementById('confirmCancel')
    const backdrop = document.getElementById('confirmBackdrop')
    msg.textContent = message
    modal.classList.add('open')
    function done(result) {
      modal.classList.remove('open')
      ok.removeEventListener('click', onOk)
      cancel.removeEventListener('click', onCancel)
      backdrop.removeEventListener('click', onCancel)
      resolve(result)
    }
    function onOk() { done(true) }
    function onCancel() { done(false) }
    ok.addEventListener('click', onOk)
    cancel.addEventListener('click', onCancel)
    backdrop.addEventListener('click', onCancel)
  })
}

function showToast(message, type) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.className = `toast ${type} show`
  setTimeout(() => toast.classList.remove('show'), 3000)
}


