const form = document.getElementById("feedbackForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(formData).toString()
    });

    if (response.ok) {
      alert("✅ Feedback submitted successfully!");
      form.reset();
    } else {
      console.error(await response.text());
      alert("❌ Submission failed");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Server error");
  }
});