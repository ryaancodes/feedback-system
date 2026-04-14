// ── SIMPLE & WORKING VERSION ─────────────────────────

const form = document.getElementById('feedbackForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const comments = document.getElementById('comments').value.trim();
  const ratingEl = document.querySelector('input[name="rating"]:checked');

  const rating = ratingEl ? Number(ratingEl.value) : null;

  // Basic validation
  if (!name || !email || !comments || !rating) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, rating, comments })
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Feedback submitted!");
      form.reset();
    } else {
      alert("❌ " + (data.message || "Submission failed"));
    }

  } catch (err) {
    console.error(err);
    alert("❌ Server error");
  }
});