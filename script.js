      const API_TOKEN = "vk-VJ3CDDVRYVF2nd2UsF2JkR26FBPAYQMb3BO8Z38FRAResNV"; // 🔁 Replace with actual token

  const promptInput = document.querySelector(".prompt_input");
const generateForm = document.querySelector(".generate_form");
const imgGallery = document.querySelector(".img_gallery");
const imgQuantitySelect = document.querySelector(".img_quantity");
const micBtn = document.getElementById("mic_btn");
const submitBtn = generateForm.querySelector("button[type='submit']");

// Create or select an error message container
let errorMessage = document.querySelector(".error_message");
if (!errorMessage) {
  errorMessage = document.createElement("p");
  errorMessage.className = "error_message";
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "10px";
  generateForm.appendChild(errorMessage);
}

generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let prompt = promptInput.value.trim();
  promptInput.value = prompt;

  // Clear previous error message
  errorMessage.textContent = "";

  if (!prompt) {
    errorMessage.textContent = "Please enter a prompt.";
    return;
  }

  // Check if prompt contains only numbers
  if (/^\d+$/.test(prompt)) {
    errorMessage.textContent = "Prompt cannot be only numbers.";
    return;
  }

  const quantity = parseInt(imgQuantitySelect.value);

  imgGallery.innerHTML = "";
  submitBtn.disabled = true;

  // Show loaders
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
  } catch (error) {
    imgGallery.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    console.error("Generation failed:", error);
  } finally {
    submitBtn.disabled = false;
  }
});

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

// Voice input with Web Speech API + Font Awesome icons
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

// **Add this to clear error message immediately on input change:**
promptInput.addEventListener("input", () => {
  errorMessage.textContent = "";
});

