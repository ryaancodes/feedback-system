// ── Admin Dashboard ─────────────────────────

const $ = id => document.getElementById(id);

// ── Auth guard ──────────────────────────────
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

// ── Utils ───────────────────────────────────
function fmtDate(str) {
  if (!str) return '-';
  const date = new Date(str);
  if (isNaN(date)) return '-';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function badge(n) {
  if (!n) return '-';
  return `<span class="badge badge-${n}">${n} ★</span>`;
}

// ── Load Stats (simple, no charts) ──────────
async function loadStats() {
  try {
    const r = await fetch('/api/feedback/analytics');
    const d = await r.json();

    if (!d.success) return;

    const stats = d.data?.stats || {};

    $('statTotal').textContent = stats.total_feedback || 0;
    $('statAvg').textContent   = stats.average_rating ? '★ ' + stats.average_rating : '—';
    $('statFive').textContent  = stats.five_star || 0;
    $('statOne').textContent   = stats.one_star || 0;

  } catch (err) {
    console.error(err);
  }
}

// ── Load Feedback ───────────────────────────
async function loadFeedback() {
  const search = $('searchInput')?.value.trim();
  const rating = $('filterRating')?.value;
  const sort   = $('sortOrder')?.value;

  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (rating) params.append('rating', rating);
  if (sort)   params.append('sort', sort);

  const body = $('tblBody');
  body.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const r = await fetch('/api/feedback?' + params.toString());
    const data = await r.json();

    if (!data.success) {
      body.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
      return;
    }

    const rows = data.data || [];

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
      return;
    }

    body.innerHTML = rows.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${row.name || '-'}</td>
        <td>${row.email || '-'}</td>
        <td>${row.rating ? badge(row.rating) : '-'}</td>
        <td>${row.comments || '-'}</td>
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

// ── Delete ─────────────────────────────────
async function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;

  try {
    const r = await fetch(`/api/feedback/${id}`, {
      method: 'DELETE'
    });

    const data = await r.json();

    if (data.success) {
      loadFeedback();
      loadStats();
    }

  } catch (err) {
    console.error(err);
  }
}

// ── Logout ─────────────────────────────────
$('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin';
});

// ── Filters ────────────────────────────────
$('searchInput')?.addEventListener('input', loadFeedback);
$('filterRating')?.addEventListener('change', loadFeedback);
$('sortOrder')?.addEventListener('change', loadFeedback);

$('clearBtn')?.addEventListener('click', () => {
  $('searchInput').value = '';
  $('filterRating').value = '';
  $('sortOrder').value = 'latest';
  loadFeedback();
});

// ── Init ───────────────────────────────────
loadStats();
loadFeedback();