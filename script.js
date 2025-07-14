const API_TOKEN = "vk-EDLcRdCFC4mwm2BXr1IUmdICYoJ2fWPNc43kDYPHVFzyJ3";

const promptInput = document.querySelector(".prompt_input");
const generateForm = document.querySelector(".generate_form");
const imgGallery = document.querySelector(".img_gallery");
const imgQuantitySelect = document.querySelector(".img_quantity");
const micBtn = document.getElementById("mic_btn");
const submitBtn = generateForm.querySelector("button[type='submit']");
const gameAnimation = document.getElementById("game_animation");

// Error message setup
let errorMessage = document.querySelector(".error_message");
if (!errorMessage) {
  errorMessage = document.createElement("p");
  errorMessage.className = "error_message";
  generateForm.appendChild(errorMessage);
}

const typingSound = document.getElementById('typing-sound');
const errorSound = document.getElementById('error-sound');

// ✨ SHOW LOADER
function showLoader() {
  gameAnimation.style.display = "flex";
}

// ❌ HIDE LOADER
function hideLoader() {
  gameAnimation.style.display = "none";
}

// Typing sound effect
promptInput.addEventListener('keydown', () => {
  if (typingSound) {
    typingSound.currentTime = 0;
    typingSound.play();
  }
});

// Form submission handler (single listener)
generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = promptInput.value.trim();
  promptInput.value = prompt;
  errorMessage.textContent = "";

  if (!prompt) {
    errorMessage.textContent = "Please enter a prompt.";
    if (errorSound) {
      errorSound.currentTime = 0;
      errorSound.play();
    }
    return;
  }

  if (/^\d+$/.test(prompt)) {
    errorMessage.textContent = "Prompt cannot be only numbers.";
    if (errorSound) {
      errorSound.currentTime = 0;
      errorSound.play();
    }
    return;
  }

  errorMessage.textContent = "";
  submitBtn.disabled = true;
  showLoader();

  const quantity = parseInt(imgQuantitySelect.value);
  imgGallery.innerHTML = "";

  // Show placeholders
  for (let i = 0; i < quantity; i++) {
    const card = document.createElement("div");
    card.className = "img_card";
    const loader = document.createElement("div");
    loader.className = "loader";
    card.appendChild(loader);
    imgGallery.appendChild(card);
  }

  try {
    const imagePromises = Array.from({ length: quantity }, () => generateImage(prompt));
    const results = await Promise.all(imagePromises);

    const cards = imgGallery.querySelectorAll(".img_card");
    results.forEach((data, i) => {
      cards[i].innerHTML = "";

      const img = document.createElement("img");
      img.src = data.image_url;
      img.alt = `Generated image ${i + 1}`;

      const downloadLink = document.createElement("a");
      downloadLink.href = img.src;
      downloadLink.download = `image_${i + 1}.png`;
      downloadLink.className = "download_btn";
      downloadLink.innerHTML = `<img src="images/download.svg" alt="Download">`;

      cards[i].appendChild(img);
      cards[i].appendChild(downloadLink);
    });

    setTimeout(() => {
      imgGallery.innerHTML = "";
    }, 60000); // Clear images after 1 minute

  } catch (error) {
    imgGallery.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    console.error("Generation failed:", error);
  } finally {
    hideLoader();
    submitBtn.disabled = false;
  }
});

// API request
async function generateImage(prompt) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("style", "flux-dev");
  formData.append("aspect_ratio", "1:1");

  const response = await fetch("https://api.vyro.ai/v2/image/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ image_url: reader.result });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 🎤 Voice input
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    micBtn.innerHTML = `<i class="fas fa-microphone-lines animate-pulse"></i>`;
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    promptInput.value = transcript;
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
  };

  recognition.onend = () => {
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Voice input not supported in this browser.";
}

// Clear error message on input
promptInput.addEventListener("input", () => {
  errorMessage.textContent = "";
});

const bgMusic = document.getElementById("bg-music");

// Start music on first user interaction (autoplay workaround)
window.addEventListener("click", () => {
  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(err => {
      console.warn("Background music autoplay blocked:", err);
    });
  }
}, { once: true });


