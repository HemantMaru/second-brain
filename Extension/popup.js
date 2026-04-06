const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");
const urlSection = document.getElementById("urlSection");
const fileSection = document.getElementById("fileSection");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const dropZone = document.getElementById("dropZone");

let currentMode = "url";

// 1. Tab Management
document.getElementById("urlMode").addEventListener("click", () => {
  currentMode = "url";
  document.getElementById("urlMode").classList.add("active");
  document.getElementById("fileMode").classList.remove("active");
  urlSection.classList.remove("hidden");
  fileSection.classList.add("hidden");
});

document.getElementById("fileMode").addEventListener("click", () => {
  currentMode = "file";
  document.getElementById("fileMode").classList.add("active");
  document.getElementById("urlMode").classList.remove("active");
  fileSection.classList.remove("hidden");
  urlSection.classList.add("hidden");
});

// 2. File Selection Trigger (CSP Compliant)
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileLabel.innerText = "✓ " + e.target.files[0].name;
    fileLabel.style.color = "#6366f1";
  }
});

// 3. Get Tab URL on Load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) document.getElementById("displayUrl").value = tabs[0].url;
});

// 4. Transmission Protocol
saveBtn.addEventListener("click", async () => {
  saveBtn.innerText = "TRANSMITTING...";
  saveBtn.disabled = true;
  status.innerText = "";
  status.className = "";

  const collection = document.getElementById("collection").value || "General";
  const note = document.getElementById("note").value;

  try {
    if (currentMode === "url") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const response = await fetch(
        "https://frontend-khaki-nu-22.vercel.app/api/item/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: tab.url, collection, note, tags: [] }),
        },
      );

      if (!response.ok) throw new Error("Vault link failed");
      handleSuccess();
    } else {
      if (fileInput.files.length === 0) {
        showError("Select a file first");
        return;
      }

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("file", file); // 👈 Backend "file" key expect kar raha hai
      formData.append("collection", collection);
      formData.append("note", note);

      // Routing based on type
      let endpoint =
        file.type === "application/pdf"
          ? "https://frontend-khaki-nu-22.vercel.app/api/item/save-pdf"
          : "https://frontend-khaki-nu-22.vercel.app/api/item/save-image";

      // 🔥 IMPORTANT: FormData ke liye manual headers mat dena!
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Upload failed");
      }
      handleSuccess();
    }
  } catch (err) {
    showError(err.message);
  }
});

function handleSuccess() {
  status.innerText = "✓ SYNAPSE SECURED";
  status.className = "success";
  setTimeout(() => window.close(), 1500);
}

function showError(msg) {
  status.innerText = "⚠ " + msg;
  status.className = "error";
  saveBtn.disabled = false;
  saveBtn.innerText = "RETRY COMMIT";
}
