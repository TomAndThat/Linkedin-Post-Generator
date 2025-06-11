const dropzone = document.getElementById("dropzone");
const imageInput = document.getElementById("imageInput");
const audienceInput = document.getElementById("audience");
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const outputText = document.getElementById("outputText");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const errorBox = document.getElementById("error");
const previewImage = document.getElementById("previewImage");
const resetBtn = document.getElementById("resetBtn");

let uploadedFile = null;
let loadingInterval = null;

const loadingPhrases = [
  "Aligning with your personal brand...",
  "Synthesising your leadership potential...",
  "Reframing the narrative for maximum impact...",
  "Calibrating professional authenticity...",
  "Strategising a disruptive engagement hook...",
  "Elevating synergy through inspirational syntax...",
];

// Drag-and-drop logic
dropzone.addEventListener("click", () => imageInput.click());
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () =>
  dropzone.classList.remove("dragover")
);
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
imageInput.addEventListener("change", (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
  uploadedFile = file;
  dropzone.textContent = `Selected: ${file.name}`;
  downloadBtn.classList.remove("d-none");

  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
    previewImage.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
}

submitBtn.addEventListener("click", async () => {
  if (!uploadedFile) {
    showError("Please upload an image first.");
    return;
  }

  const formData = new FormData();
  formData.append("image", uploadedFile);
  formData.append("audience", audienceInput.value);

  setLoading(true);

  try {
    const res = await fetch("/generate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Unknown error");

    outputText.textContent = data.text;
    result.classList.remove("d-none");
    errorBox.classList.add("d-none");

    setTimeout(() => {
      result.scrollIntoView({ behavior: "smooth" });
    }, 300);
  } catch (err) {
    showError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(outputText.textContent);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy Text"), 2000);
});

downloadBtn.addEventListener("click", () => {
  const url = URL.createObjectURL(uploadedFile);
  const a = document.createElement("a");
  a.href = url;
  a.download = uploadedFile.name || "linkedin-photo.jpg";
  a.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener("click", resetForm);

function resetForm() {
  uploadedFile = null;
  imageInput.value = "";
  audienceInput.value = "";
  dropzone.textContent = "Drag and drop an image here, or click to select";
  previewImage.src = "";
  previewImage.classList.add("d-none");
  result.classList.add("d-none");
  errorBox.classList.add("d-none");
}

function setLoading(state) {
  loading.classList.toggle("d-none", !state);
  submitBtn.disabled = state;

  if (state) {
    let i = 0;
    loading.textContent = loadingPhrases[i % loadingPhrases.length];
    loadingInterval = setInterval(() => {
      i++;
      loading.textContent = loadingPhrases[i % loadingPhrases.length];
    }, 2000);
  } else {
    clearInterval(loadingInterval);
    loading.textContent = "";
  }
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
  result.classList.add("d-none");
  previewImage.classList.add("d-none");
}
