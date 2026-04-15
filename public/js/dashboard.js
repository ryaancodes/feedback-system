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

function badge(n) {
  return n ? `<span>${n} ★</span>` : '-';
}

// ── LOAD ANALYTICS ──
async function loadAnalytics() {
  const r = await fetch('/api/feedback/analytics', { credentials: 'include' });
  const d = await r.json();

  if (!d.success) return;

  const s = d.data.stats;

  $('statTotal').textContent = s.total_feedback || 0;
  $('statAvg').textContent   = s.average_rating ? '★ ' + s.average_rating : '-';
  $('statFive').textContent  = s.five_star || 0;
  $('statOne').textContent   = s.one_star || 0;
}

// ── LOAD FEEDBACK (MAIN FIX) ──
async function loadFeedback() {
  const search = $('searchInput').value;
  const rating = $('filterRating').value;
  const sort   = $('sortOrder').value;

  let url = '/api/feedback?';

  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (rating) url += `rating=${rating}&`;
  if (sort)   url += `sort=${sort}`;

  console.log("API CALL:", url); // 🔥 DEBUG

  const body = $('tblBody');
  body.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const r = await fetch(url, { credentials: 'include' });
    const d = await r.json();

    if (!d.success) throw new Error();

    const rows = d.data;

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

  } catch {
    body.innerHTML = `<tr><td colspan="7">Error</td></tr>`;
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

// ── EVENTS (THIS WAS YOUR MAIN ISSUE) ──
$('searchInput').addEventListener('keyup', loadFeedback);
$('filterRating').addEventListener('change', loadFeedback);
$('sortOrder').addEventListener('change', loadFeedback);

$('clearBtn').addEventListener('click', () => {
  $('searchInput').value = '';
  $('filterRating').value = '';
  $('sortOrder').value = 'latest';
  loadFeedback();
});

// ── INIT ──
loadAnalytics();
loadFeedback();