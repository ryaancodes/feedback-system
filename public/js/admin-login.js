 // public/js/admin-login.js

const $ = id => document.getElementById(id);

// Redirect if already logged in
(async () => {
  try {
    const r = await fetch('/api/admin/check', {
      credentials: 'include' // 🔥 IMPORTANT
    });
    const d = await r.json();

    if (d.success) window.location.href = '/dashboard';
  } catch (_) {}
})();

// ── Toast ─────────────────────────────────────────
function toast(msg, type = 'error') {
  const wrap = $('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

// ── Input validation ──────────────────────────────
function setErr(grp) { $(grp).classList.add('invalid'); }
function clrErr(grp) { $(grp).classList.remove('invalid'); }

['username','password'].forEach(id => {
  $(id).addEventListener('input', () => clrErr(`grp-${id}`));
});

// ── Login submit ─────────────────────────────────
$('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = $('username').value.trim();
  const password = $('password').value;
  let ok = true;

  if (!username) { setErr('grp-username'); ok = false; } else clrErr('grp-username');
  if (!password) { setErr('grp-password'); ok = false; } else clrErr('grp-password');
  if (!ok) return;

  const errBox = $('loginError');
  errBox.classList.remove('show');

  const btn = $('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Signing in…';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔥 CRITICAL FIX
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = '/dashboard';
    } else {
      $('loginErrorMsg').textContent = data.message || 'Invalid credentials.';
      errBox.classList.add('show');
    }

  } catch (_) {
    $('loginErrorMsg').textContent = 'Could not connect to server.';
    errBox.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In →';
  }
});