const form = document.querySelector("#roadmap-form");
const topicInput = document.querySelector("#topic");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#status-message");
const result = document.querySelector("#roadmap-result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const topic = topicInput.value.trim();
  if (!topic) return;

  console.log(`[User Action] Form submitted for topic: "${topic}"`);
  setLoading(true);
  statusMessage.textContent = "Asking Gemini to build your roadmap...";
  result.classList.add("hidden");
  result.innerHTML = "";

  try {
    console.log(`[API Request] Fetching roadmap from /api/roadmap/generate`);
    const response = await fetch("/api/roadmap/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API Error] Status: ${response.status}, Message: ${data.error}`);
      throw new Error(data.error || "Unable to generate roadmap.");
    }

    console.log(`[API Success] Roadmap received: "${data.title}"`);
    renderRoadmap(data);
    statusMessage.textContent = "Roadmap generated.";
  } catch (error) {
    console.error(`[Client Error] ${error.message}`);
    statusMessage.textContent = error.message;
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Generating..." : "Generate";
}

function renderRoadmap(roadmap) {
  console.log(`[UI] Rendering roadmap with ${roadmap.steps.length} steps`);
  const steps = roadmap.steps
    .map((step) => {
      const resources = step.resources
        .map((resource) => `<li>${escapeHtml(resource)}</li>`)
        .join("");

      return `
        <article class="step">
          <span class="step-number">${step.number}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.description)}</p>
          ${
            resources
              ? `<ul class="resources">${resources}</ul>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  result.innerHTML = `
    <h2 class="roadmap-title">${escapeHtml(roadmap.title)}</h2>
    <div class="steps">${steps}</div>
  `;
  result.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
