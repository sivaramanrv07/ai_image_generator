const API_TOKEN = "vk-vfye26qBB8wxHzNJZbWMjm4qP8ShUDrgWZHBv7cj3leZf2";

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

// ✨ SHOW LOADER
function showLoader() {
  gameAnimation.style.display = "flex";
}

// ❌ HIDE LOADER
function hideLoader() {
  gameAnimation.style.display = "none";
}

// Form submission
generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = promptInput.value.trim();
  promptInput.value = prompt;
  errorMessage.textContent = "";

  if (!prompt) {
    errorMessage.textContent = "Please enter a prompt.";
    return;
  }
  if (/^\d+$/.test(prompt)) {
    errorMessage.textContent = "Prompt cannot be only numbers.";
    return;
  }

  const quantity = parseInt(imgQuantitySelect.value);
  imgGallery.innerHTML = "";
  submitBtn.disabled = true;
  showLoader();

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
}, 60000); // 1 minute = 60000 milliseconds

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

// ❌ Clear error on input
promptInput.addEventListener("input", () => {
  errorMessage.textContent = "";
});

// 🎈 Balloon Game Animation
const canvas = document.getElementById("balloon_canvas");
const ctx = canvas.getContext("2d");
const popSound = new Audio("sounds/pop.mp3");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let balloons = [];

function createBalloon() {
  const messages = [
    "🎈 Balloon popped!", "✨ Great job!", "💥 Boom!", "😄 Keep going!",
    "🌟 You did it!", "🎉 Nice pop!", "🥳 Wow!", "👏 Pop success!",
    "👍 Well done!", "🎊 Fun burst!"
  ];
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 100,
    radius: 30 + Math.random() * 20,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    speed: 1 + Math.random() * 2,
    visible: true,
    message: messages[Math.floor(Math.random() * messages.length)]
  };
}

for (let i = 0; i < 15; i++) {
  balloons.push(createBalloon());
}

function showBalloonMessage(text) {
  const msg = document.getElementById("balloon_message");
  msg.textContent = text;
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.display = "none";
  }, 2000);
}

function drawBalloons() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of balloons) {
    if (!b.visible) continue;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    b.y -= b.speed;

    if (b.y + b.radius < 0) {
      Object.assign(b, createBalloon());
    }
  }
}

function animate() {
  drawBalloons();
  requestAnimationFrame(animate);
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  balloons.forEach((b) => {
    if (!b.visible) return;
    const dist = Math.hypot(b.x - clickX, b.y - clickY);
    if (dist < b.radius) {
      b.visible = false;
      popSound.currentTime = 0;
      popSound.play();
      showBalloonMessage(b.message);
    }
  });
});

animate();
