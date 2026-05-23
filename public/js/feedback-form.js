const form = document.getElementById('feedbackForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch('/', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('✅ Feedback submitted!');
      form.reset();
    } else {
      alert('❌ Submission failed');
    }
  } catch (error) {
    console.error(error);
    alert('❌ Server error');
  }
});