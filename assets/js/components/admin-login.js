import { supabase } from '../supabase-client.js'

const form = document.getElementById('loginForm')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')
const errorEl = document.getElementById('loginError')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorEl.classList.remove('visible')
  loginBtn.disabled = true
  loginBtn.textContent = 'Connexion...'

  const email = emailInput.value.trim()
  const password = passwordInput.value

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const msg = parseError(error.message)
      showError(msg)
      loginBtn.disabled = false
      loginBtn.textContent = 'Se connecter'
      return
    }

    window.location.href = 'admin-dashboard.html'
  } catch (err) {
    showError('Erreur de connexion. Vérifie que Supabase est bien configuré.')
    loginBtn.disabled = false
    loginBtn.textContent = 'Se connecter'
  }
})

function parseError(msg) {
  if (!msg) return 'Erreur inconnue'
  let desc = msg
  try {
    const j = JSON.parse(msg)
    desc = j.error_description || j.msg || j.error || msg
  } catch {}
  if (desc.includes('Invalid login credentials') || desc === 'invalid_grant') return 'Email ou mot de passe incorrect.'
  if (desc.includes('Email not confirmed')) return 'Email non confirmé.'
  return desc
}

function showError(msg) {
  errorEl.textContent = msg
  errorEl.classList.add('visible')
}
