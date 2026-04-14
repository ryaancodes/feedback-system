// ── Admin Dashboard ───────────────────────────────────────────

const $ = id => document.getElementById(id);

// ── Auth guard ────────────────────────────────────────────────
(async () => {
  try {
    const r = await fetch('/api/admin/check', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) return (window.location.href = '/admin');

    $('adminUser').textContent = '👤 ' + d.username;
  } catch {
    window.location.href = '/admin';
  }
})();

// ── Utils ─────────────────────────────────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(s)));
  return d.innerHTML;
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function badge(n) {
  return `<span class="badge badge-${n}">${n} ★</span>`;
}

// ── Load Analytics ────────────────────────────────────────────
async function loadAnalytics() {
  try {
    const r = await fetch('/api/feedback/analytics', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) return;

    const stats = d.data.stats || {};

    $('statTotal').textContent = stats.total_feedback || 0;
    $('statAvg').textContent   = stats.average_rating ? '★ ' + stats.average_rating : '—';
    $('statFive').textContent  = stats.five_star || 0;
    $('statOne').textContent   = stats.one_star || 0;

  } catch (err) {
    console.error(err);
  }
}

// ── 🔥 FIXED Load Feedback (IMPORTANT) ─────────────────────────
async function loadFeedback() {
  const search = $('searchInput')?.value.trim();
  const rating = $('filterRating')?.value;
  const sort   = $('sortOrder')?.value;

  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (rating) params.append('rating', rating);
  if (sort)   params.append('sort', sort);

  console.log("QUERY:", params.toString());

  const body = $('tblBody');
  body.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const r = await fetch('/api/feedback?' + params.toString(), {
      credentials: 'include'
    });

    const data = await r.json();

    if (!data.success) {
      body.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
      return;
    }

    const rows = data.data;

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
      return;
    }

    body.innerHTML = rows.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(row.name)}</td>
        <td>${esc(row.email)}</td>
        <td>${badge(row.rating)}</td>
        <td>${esc(row.comments)}</td>
        <td>${fmtDate(row.submitted_at)}</td>
        <td>
          <button onclick="deleteFeedback(${row.id})">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="7">Server error</td></tr>`;
  }
}

// ── Delete ────────────────────────────────────────────────────
async function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;

  try {
    const r = await fetch(`/api/feedback/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await r.json();

    if (data.success) {
      loadFeedback();
      loadAnalytics();
    }

  } catch (err) {
    console.error(err);
  }
}

// ── Logout ────────────────────────────────────────────────────
$('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include'
  });

  window.location.href = '/admin';
});

// ── 🔥 FILTER LISTENERS ───────────────────────────────────────
$('searchInput')?.addEventListener('input', loadFeedback);
$('filterRating')?.addEventListener('change', loadFeedback);
$('sortOrder')?.addEventListener('change', loadFeedback);

$('clearBtn')?.addEventListener('click', () => {
  $('searchInput').value = '';
  $('filterRating').value = '';
  $('sortOrder').value = 'latest';
  loadFeedback();
});

// ── Init ──────────────────────────────────────────────────────
loadAnalytics();
loadFeedback();