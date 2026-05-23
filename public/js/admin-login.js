// public/js/admin-login.js

const $ = id => document.getElementById(id);

// ── Check if already logged in ───────────────────
(async () => {
  try {
    const r = await fetch('/api/admin/check', {
      credentials: 'include'
    });
    const d = await r.json();

    if (d.success) {
      window.location.replace('/dashboard');
    }
  } catch (_) {}
})();

// ── Toast (optional UI) ─────────────────────────
function toast(msg, type = 'error') {
  const wrap = $('toastWrap');
  if (!wrap) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span><span>${msg}</span>`;
  wrap.appendChild(el);

  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

// ── Input validation ────────────────────────────
function setErr(grp) { $(grp).classList.add('invalid'); }
function clrErr(grp) { $(grp).classList.remove('invalid'); }

['username','password'].forEach(id => {
  $(id).addEventListener('input', () => clrErr(`grp-${id}`));
});

// ── Login submit ────────────────────────────────
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
      credentials: 'include', // 🔥 required for sessions
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.replace('/dashboard'); // 🔥 redirect
    } else {
      $('loginErrorMsg').textContent = data.message || 'Invalid credentials.';
      errBox.classList.add('show');
    }

  } catch (err) {
    console.error(err);
    $('loginErrorMsg').textContent = 'Server error. Try again.';
    errBox.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In →';
  }
});