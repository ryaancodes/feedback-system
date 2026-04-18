// ── SAFE SELECTOR ──
const $ = id => document.getElementById(id);

// ── AUTH ──
(async () => {
  try {
    const r = await fetch('/api/admin/check', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) window.location.href = '/admin';
    else if ($('adminUser')) $('adminUser').textContent = '👤 ' + d.username;
  } catch {
    window.location.href = '/admin';
  }
})();

// ── HELPERS ──
function fmtDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return isNaN(d) ? '-' : d.toLocaleDateString('en-IN');
}

function badge(n) {
  return n ? `<span class="badge badge-${n}">${n} ★</span>` : '-';
}

// ── ANALYTICS ──
async function loadAnalytics() {
  try {
    const r = await fetch('/api/feedback/analytics', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) return;

    const s = d.data.stats;

    if ($('statTotal')) $('statTotal').textContent = s.total_feedback || 0;
    if ($('statAvg'))   $('statAvg').textContent   = s.average_rating ? '★ ' + s.average_rating : '-';
    if ($('statFive'))  $('statFive').textContent  = s.five_star || 0;
    if ($('statOne'))   $('statOne').textContent   = s.one_star || 0;

  } catch (err) {
    console.error(err);
  }
}

// ── FEEDBACK ──
async function loadFeedback() {
  try {
    const search = $('searchInput')?.value || '';
    const rating = $('filterRating')?.value || '';
    const sort   = $('sortOrder')?.value || '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (rating) params.append('rating', rating);
    if (sort)   params.append('sort', sort);

    const r = await fetch('/api/feedback?' + params.toString(), {
      credentials: 'include'
    });

    const d = await r.json();
    if (!d.success) throw new Error();

    const rows = d.data || [];
    const body = $('tblBody');

    if (!body) return;

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
      return;
    }

    body.innerHTML = rows.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${row.name || '-'}</td>
        <td>${row.email || '-'}</td>
        <td>${badge(row.rating)}</td>
        <td>${row.comments || '-'}</td>
        <td>${fmtDate(row.submitted_at)}</td>
        <td><button onclick="deleteFeedback(${row.id})">Delete</button></td>
      </tr>
    `).join('');

  } catch (err) {
    console.error(err);
    const body = $('tblBody');
    if (body) body.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
  }
}

// ── DELETE ──
async function deleteFeedback(id) {
  if (!confirm('Delete?')) return;

  await fetch(`/api/feedback/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  loadFeedback();
  loadAnalytics();
}

// ── EVENTS (SAFE) ──
window.addEventListener('DOMContentLoaded', () => {

  $('searchInput')?.addEventListener('input', loadFeedback);
  $('filterRating')?.addEventListener('change', loadFeedback);
  $('sortOrder')?.addEventListener('change', loadFeedback);

  $('clearBtn')?.addEventListener('click', () => {
    if ($('searchInput')) $('searchInput').value = '';
    if ($('filterRating')) $('filterRating').value = '';
    if ($('sortOrder')) $('sortOrder').value = 'latest';
    loadFeedback();
  });

  $('logoutBtn')?.addEventListener('click', async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/admin';
  });

});

// ── INIT ──
loadAnalytics();
loadFeedback();