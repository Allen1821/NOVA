// Main elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const flashOverlay = document.getElementById("flash-overlay");
const stickerContainer = document.getElementById("sticker-container");
const countdownElem = document.getElementById("countdown");

const showCameraButton = document.getElementById("show-camera");
const captureButton = document.getElementById("capture");
const nextShotButton = document.getElementById("next-shot");
const nextButton = document.getElementById("next-btn");
const retakeButton = document.getElementById("retake-btn");
const closeCameraButton = document.getElementById("close-camera");
const shotCountText = document.getElementById("shot-count");

const filterButtons = document.querySelectorAll(".filter");
const stickerButtons = document.querySelectorAll(".sticker-btn");
const bgButtons = document.querySelectorAll(".bg-btn");
const timerButtons = document.querySelectorAll(".timer-btn");

// Global settings
let selectedFilter = "none";
let selectedBg = "white";
let timerDelay = 3;
let shots = [];
let currentShot = 0;
let videoReady = false;
let selectedLighting = "warm";
let isCapturing = false;
let stream = null; // Global stream variable
let isFlipped = false;

// Start the webcam 
function startCamera() {
  if (stream) {
    // If the stream is already active, simply show the video element.
    video.classList.remove("hidden");
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.classList.remove("hidden");
      video.addEventListener("loadedmetadata", () => {
        videoReady = true;
      });
    })
    .catch(err => {
      // Handle errors if needed
    });
}

// Show Camera button
showCameraButton.addEventListener("click", () => {
  startCamera();
  captureButton.classList.remove("hidden");
  showCameraButton.classList.add("hidden");
  closeCameraButton.classList.remove("hidden");
});

// Close Camera button – this will hide the video view without stopping the stream
closeCameraButton.addEventListener("click", () => {
  video.classList.add("hidden");
  captureButton.classList.add("hidden");
  closeCameraButton.classList.add("hidden");
  showCameraButton.classList.remove("hidden");
});

// Timer buttons
timerButtons.forEach(button => {
  button.addEventListener("click", () => {
    timerDelay = parseInt(button.getAttribute("data-time"));
    timerButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

// Live filter
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedFilter = button.getAttribute("data-filter");
    if (selectedFilter === "grayscale") {
      video.style.filter = "grayscale(100%)";
    } else if (selectedFilter === "sepia") {
      video.style.filter = "sepia(100%)";
    } else if (selectedFilter === "invert") {
      video.style.filter = "invert(100%)";
    } else {
      video.style.filter = "none";
    }
    filterButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

// Sticker buttons
stickerButtons.forEach(button => {
  button.addEventListener("click", () => {
    const stickerChar = button.getAttribute("data-sticker");
    if (stickerChar === "none") return;
    addSticker(stickerChar);
  });
});

function addSticker(stickerChar) {
  const sticker = document.createElement("div");
  sticker.classList.add("sticker");
  sticker.textContent = stickerChar;
  sticker.style.left = "50px";
  sticker.style.top = "50px";
  makeDraggable(sticker);
  stickerContainer.appendChild(sticker);
}

function makeDraggable(el) {
  let offsetX = 0, offsetY = 0, isDragging = false;
  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      const containerRect = video.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + elRect.width > containerRect.width) x = containerRect.width - elRect.width;
      if (y + elRect.height > containerRect.height) y = containerRect.height - elRect.height;
      el.style.left = x + "px";
      el.style.top = y + "px";
    }
  });
  document.addEventListener("mouseup", () => { isDragging = false; });
}

// Background selection
bgButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedBg = button.getAttribute("data-bg");
    bgButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

// Countdown function
function countdown(seconds) {
  return new Promise(resolve => {
    let counter = seconds;
    countdownElem.textContent = counter;
    countdownElem.style.display = "block";
    
    const interval = setInterval(() => {
      counter--;
      if (counter > 0) {
        countdownElem.textContent = counter;
      } else {
        clearInterval(interval);
        countdownElem.textContent = "";
        countdownElem.style.display = "none";
        resolve();
      }
    }, 1000);
  });
}

// Flash effect
function flash() {
  flashOverlay.classList.remove("hidden");
  flashOverlay.classList.add("active");
  setTimeout(() => {
    flashOverlay.classList.remove("active");
    flashOverlay.classList.add("hidden");
  }, 300);
}

// Create lighting overlay for capture effect
function createLightingOverlay() {
  const existingOverlay = document.getElementById("lighting-overlay");
  if (existingOverlay) {
    document.body.removeChild(existingOverlay);
  }
  
  const overlay = document.createElement("div");
  overlay.id = "lighting-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "black";
  overlay.style.opacity = "0.95";
  overlay.style.zIndex = "999"; 
  overlay.style.transition = "opacity 0.5s ease";
  document.body.appendChild(overlay);
  
  const videoContainer = document.querySelector(".video-container");
  videoContainer.style.position = "relative";
  videoContainer.style.zIndex = "1000";
  
  if (selectedLighting === "warm") {
    videoContainer.style.boxShadow = "0 0 60px 30px rgba(255, 174, 66, 0.8)";
    videoContainer.style.border = "5px solid rgba(255, 174, 66, 0.8)";
  } else if (selectedLighting === "white") {
    videoContainer.style.boxShadow = "0 0 60px 30px rgba(255, 255, 255, 0.8)";
    videoContainer.style.border = "5px solid rgba(255, 255, 255, 0.8)";
  } else if (selectedLighting === "pink") {
    videoContainer.style.boxShadow = "0 0 60px 30px rgba(255, 105, 180, 0.8)";
    videoContainer.style.border = "5px solid rgba(255, 105, 180, 0.8)";
  } else {
    // fallback default to pink
    videoContainer.style.boxShadow = "0 0 60px 30px rgba(255, 105, 180, 0.8)";
    videoContainer.style.border = "5px solid rgba(255, 105, 180, 0.8)";
  }
  
  return overlay;
}

// Remove lighting overlay
function removeLightingOverlay() {
  const overlay = document.getElementById("lighting-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 500);
  }
  
  const videoContainer = document.querySelector(".video-container");
  videoContainer.style.boxShadow = "";
  videoContainer.style.border = "";
}

// Capture a shot (video frame + stickers)
// This version accepts an optional parameter (default true) to remove the overlay after capture.
function captureShot(removeOverlayAfter = true) {
  return new Promise(resolve => {
    if (!videoReady) return;
    
    if (!document.getElementById("lighting-overlay")) {
      createLightingOverlay();
    }
    
    flash();
    
    setTimeout(() => {
      const photoWidth = (video.videoWidth > 0 ? video.videoWidth : 600);
      const photoHeight = (video.videoHeight > 0 ? video.videoHeight : 450);
      canvas.width = photoWidth;
      canvas.height = photoHeight;
      const ctx = canvas.getContext("2d");
      
      if (selectedFilter === "grayscale") {
        ctx.filter = "grayscale(100%)";
      } else if (selectedFilter === "sepia") {
        ctx.filter = "sepia(100%)";
      } else if (selectedFilter === "invert") {
        ctx.filter = "invert(100%)";
      } else {
        ctx.filter = "none";
      }
      
      if (isFlipped) {
        ctx.save();
        ctx.translate(photoWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, photoWidth, photoHeight);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, photoWidth, photoHeight);
      }
      
      const dataURL = canvas.toDataURL("image/png");
      shots.push(dataURL);
      currentShot++;
      shotCountText.textContent = `Shot ${currentShot} of 4`;
      
      updateSidePreview();
      
      if (removeOverlayAfter) {
        setTimeout(() => {
          removeLightingOverlay();
          resolve();
        }, 1000);
      } else {
        resolve();
      }
    }, 350);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const nextButton = document.getElementById("next-btn");
  if (nextButton) {
    nextButton.disabled = false;
    nextButton.addEventListener("click", () => {
      if (shots.length > 0) {
        localStorage.setItem("photoShots", JSON.stringify(shots));
        window.location.href = "preview.html";
      } else {
        alert("No shots captured! Please take a photo first.");
      }
    });
  }
});

// Capture all shots function
async function captureAllShots() {
  if (isCapturing) return;
  isCapturing = true;
  
  captureButton.disabled = true;
  
  createLightingOverlay();
  
  for (let i = 1; i <= 4; i++) {
    if (i > 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await countdown(timerDelay);
    await captureShot(false);
    
    shotCountText.textContent = `Shot ${i} of 4`;
  }
  
  setTimeout(() => {
    removeLightingOverlay();
  }, 1000);
  
  nextButton.classList.remove("hidden");
  retakeButton.classList.remove("hidden");
  captureButton.classList.add("hidden");
  isCapturing = false;
}

// Retake functionality
retakeButton.addEventListener("click", () => {
  shots = [];
  currentShot = 0;
  shotCountText.textContent = `Shot 0 of 4`;
  updateSidePreview();
  
  nextButton.classList.add("hidden");
  retakeButton.classList.add("hidden");
  captureButton.classList.remove("hidden");
  captureButton.disabled = false;
});

function updateSidePreview() {
  const previewDiv = document.getElementById("side-preview");
  if (!previewDiv) {
    return;
  }
  
  previewDiv.innerHTML = "<h3 class='preview-title'>Your Photos</h3>";
  shots.forEach(shot => {
    const img = document.createElement("img");
    img.src = shot;
    previewDiv.appendChild(img);
  });
}

captureButton.addEventListener("click", () => {
  captureAllShots();
});

// Lighting controls
const lightingButtons = document.querySelectorAll(".lighting-btn");
lightingButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedLighting = button.getAttribute("data-light");
    lightingButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

const lightingSlider = document.getElementById("lighting-slider");
if (lightingSlider) {
  lightingSlider.addEventListener("input", updateLighting);
}

function updateLighting() {
  if (!lightingSlider) return;
  
  const intensity = lightingSlider.value / 100;
  const videoContainer = document.querySelector(".video-container");
  const glowSize = 20 + (intensity * 30);
  
  if (selectedLighting === "warm") {
    videoContainer.style.boxShadow = `0 0 ${glowSize}px ${glowSize / 2}px rgba(255, 174, 66, ${intensity})`;
  } else if (selectedLighting === "white") {
    videoContainer.style.boxShadow = `0 0 ${glowSize}px ${glowSize / 2}px rgba(255, 255, 255, ${intensity})`;
  } else if (selectedLighting === "pink") {
    videoContainer.style.boxShadow = `0 0 ${glowSize}px ${glowSize / 2}px rgba(255, 105, 180, ${intensity})`;
  } else {
    videoContainer.style.boxShadow = `0 0 ${glowSize}px ${glowSize / 2}px rgba(100, 255, 100, ${intensity})`;
  }
}

// Flip functionality
const flipButton = document.getElementById("flip-btn");
flipButton.addEventListener("click", () => {
  isFlipped = !isFlipped;
  updateMirror();
  flipButton.classList.toggle("selected", isFlipped);
});

function updateMirror() {
  video.style.transform = isFlipped ? "scaleX(-1)" : "scaleX(1)";
}


function captureShot(removeOverlayAfter = true) {
  return new Promise(resolve => {
    if (!videoReady) {
    }
    
    if (!document.getElementById("lighting-overlay")) {
      createLightingOverlay();
    }
    
    flash();
    
    setTimeout(() => {
      const photoWidth = (video.videoWidth > 0 ? video.videoWidth : 600);
      const photoHeight = (video.videoHeight > 0 ? video.videoHeight : 450);
      canvas.width = photoWidth;
      canvas.height = photoHeight;
      const ctx = canvas.getContext("2d");
      
      if (selectedFilter === "grayscale") {
        ctx.filter = "grayscale(100%)";
      } else if (selectedFilter === "sepia") {
        ctx.filter = "sepia(100%)";
      } else if (selectedFilter === "invert") {
        ctx.filter = "invert(100%)";
      } else {
        ctx.filter = "none";
      }
      
      if (isFlipped) {
        ctx.save();
        ctx.translate(photoWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, photoWidth, photoHeight);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, photoWidth, photoHeight);
      }
      
      const dataURL = canvas.toDataURL("image/png");
      shots.push(dataURL);
      currentShot++;
      shotCountText.textContent = `Shot ${currentShot} of 4`;
      
      updateSidePreview();
      
      if (removeOverlayAfter) {
        setTimeout(() => {
          removeLightingOverlay();
          resolve();
        }, 1000);
      } else {
        resolve();
      }
    }, 350);
  });
}

