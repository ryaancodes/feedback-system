const $ = id => document.getElementById(id);

// ── AUTH ──
(async () => {
  try {
    const r = await fetch('/api/admin/check', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) window.location.href = '/admin';
    else $('adminUser').textContent = '👤 ' + d.username;
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

// ── LOAD ANALYTICS ──
async function loadAnalytics() {
  try {
    const r = await fetch('/api/feedback/analytics', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) return;

    const s = d.data.stats;

    $('statTotal').textContent = s.total_feedback || 0;
    $('statAvg').textContent   = s.average_rating ? '★ ' + s.average_rating : '-';
    $('statFive').textContent  = s.five_star || 0;
    $('statOne').textContent   = s.one_star || 0;
  } catch (e) {
    console.error(e);
  }
}

// ── LOAD FEEDBACK (NO FILTERS) ──
async function loadFeedback() {
  const body = $('tblBody');
  body.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const r = await fetch('/api/feedback', { credentials: 'include' });
    const d = await r.json();

    if (!d.success) throw new Error();

    const rows = d.data || [];

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
      return;
    }

    body.innerHTML = rows.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${row.name || '-'}</td>
        <td>${row.email || '-'}</td>
        <td>${row.rating || '-'} ★</td>
        <td>${row.comments || '-'}</td>
        <td>${fmtDate(row.submitted_at)}</td>
        <td>
          <button onclick="deleteFeedback(${row.id})">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
  }
}

// ── DELETE ──
async function deleteFeedback(id) {
  if (!confirm('Delete?')) return;

  try {
    await fetch(`/api/feedback/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    loadFeedback();
    loadAnalytics();
  } catch (e) {
    console.error(e);
  }
}

// ── LOGOUT (FIXED) ──
$('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include'
  });

  window.location.href = '/admin';
});

// ── INIT ──
loadAnalytics();
loadFeedback();