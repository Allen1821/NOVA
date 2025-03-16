/* Integrated Collage JavaScript */

// -----------------------------
// Grid Mode Measurements (1300 x 1800 Canvas)
// -----------------------------
const gridCanvasWidth = 1300;
const gridCanvasHeight = 1800;
const gridReservedBottom = 180; // Branding area for grid mode
const gridHorizontalGap = 50;
const gridVerticalGap = 40;
const availableWidthForGrid = gridCanvasWidth - (3 * gridHorizontalGap);
const gridImageWidth = availableWidthForGrid / 2;
const gridImageHeight = Math.round(gridImageWidth * (4 / 3));
const gridAvailableHeight = gridCanvasHeight - gridReservedBottom - (2 * gridImageHeight) - (3 * gridVerticalGap);
const gridYOffset = gridVerticalGap + (gridAvailableHeight / 2);

// -----------------------------
// Classic Mode Measurements (576 x 1728 Canvas)
// -----------------------------
const canvasWidth = 576;
const canvasHeight = 1728;
const reservedBottom = 150;
const availableHeight = canvasHeight - reservedBottom;
const verticalGap = 30;
const numberOfGaps = 5;
const totalVerticalGap = verticalGap * numberOfGaps;
const imageHeight = Math.round((availableHeight - totalVerticalGap) / 4); // ~357 px
const aspectRatio = 1.4;
const imageWidth = Math.round(imageHeight * aspectRatio); // ~500 px
const horizontalMargin = Math.round((canvasWidth - imageWidth) / 2); // ~38 px

// -----------------------------
// Global Template Variable
// -----------------------------
let currentTemplate = localStorage.getItem("photoTemplate") || "classic";

// -----------------------------
// Image Loader Function
// -----------------------------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      // Fallback image
      const fallbackImg = new Image();
      fallbackImg.src = `https://via.placeholder.com/300x100?text=NOVA+LOGO`;
      fallbackImg.onload = () => {
        resolve(fallbackImg);
      };
      fallbackImg.onerror = () => reject(new Error("Even fallback image failed to load"));
    };
    img.src = src;
  });
}

// -----------------------------
// Helper: drawImageCover for Grid Mode (crops image without stretching)
// -----------------------------
function drawImageCover(ctx, img, destX, destY, destWidth, destHeight) {
  const sourceWidth = img.width;
  const sourceHeight = img.height;
  const sourceRatio = sourceWidth / sourceHeight;
  const destRatio = destWidth / destHeight;

  let cropWidth, cropHeight, cropX, cropY;

  if (sourceRatio > destRatio) {
    cropHeight = sourceHeight;
    cropWidth = cropHeight * destRatio;
    cropX = (sourceWidth - cropWidth) / 2;
    cropY = 0;
  } else {
    cropWidth = sourceWidth;
    cropHeight = cropWidth / destRatio;
    cropX = 0;
    cropY = (sourceHeight - cropHeight) / 2;
  }
  ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, destX, destY, destWidth, destHeight);
}

// -----------------------------
// Template Drawing Functions
// -----------------------------

// Grid Template Function (Grid Mode)
async function drawGridTemplate(shots, canvas, ctx) {
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const index = row * 2 + col;
      if (!shots[index]) continue;
      
      const img = await loadImage(shots[index]);
      
      const x = gridHorizontalGap + col * (gridImageWidth + gridHorizontalGap);
      const y = gridYOffset + row * (gridImageHeight + gridVerticalGap);
      
      drawImageCover(ctx, img, x, y, gridImageWidth, gridImageHeight);
      
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, gridImageWidth, gridImageHeight);
    }
  }
}

// Classic Template Function (Classic Mode)
async function drawClassicTemplate(shots, canvas, ctx) {
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, imageWidth, imageHeight);
  }
}

// -----------------------------
// Other Template Functions
// -----------------------------
async function drawPolaroidTemplate(shots) {
  const polaroidBorder = 20;
  const polaroidBottom = 40;
  const polaroidWidth = imageWidth + (polaroidBorder * 2);
  const polaroidHeight = imageHeight + (polaroidBottom + polaroidBorder);
  
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (polaroidHeight + verticalGap/2);
    const x = (canvasWidth - polaroidWidth) / 2;
    
    ctx.save();
    ctx.translate(x + polaroidWidth/2, y + polaroidHeight/2);
    const rotation = (Math.random() - 0.5) * 0.05;
    ctx.rotate(rotation);
    
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(-polaroidWidth/2, -polaroidHeight/2, polaroidWidth, polaroidHeight);
    ctx.shadowColor = "transparent";
    
    ctx.drawImage(img, -imageWidth/2, -imageHeight/2 - polaroidBottom/4, imageWidth, imageHeight);
    
    ctx.restore();
  }
}

async function drawVintageTemplate(shots) {
  const frameColor = "#222";
  const frameBorder = 15;
  const frameHeight = imageHeight + (frameBorder * 2);
  const frameWidth = imageWidth + (frameBorder * 2);
  
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  function applySepiaFilter(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
    return imageData;
  }
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (frameHeight + verticalGap/2);
    const x = (canvasWidth - frameWidth) / 2;
    
    ctx.fillStyle = frameColor;
    ctx.fillRect(x, y, frameWidth, frameHeight);
    
    ctx.drawImage(img, x + frameBorder, y + frameBorder, imageWidth, imageHeight);
    
    const imageData = ctx.getImageData(x + frameBorder, y + frameBorder, imageWidth, imageHeight);
    const sepiaData = applySepiaFilter(imageData);
    ctx.putImageData(sepiaData, x + frameBorder, y + frameBorder);
    
    const holeSize = 10, holeSpacing = 30;
    ctx.fillStyle = "#000";
    for (let h = y + holeSpacing; h < y + frameHeight - holeSize; h += holeSpacing) {
      ctx.beginPath();
      ctx.arc(x + frameBorder/2, h, holeSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x + frameWidth - frameBorder/2, h, holeSize/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

async function drawModernTemplate(shots) {
  const cornerRadius = 20;
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + imageWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + imageWidth, y, x + imageWidth, y + cornerRadius);
    ctx.lineTo(x + imageWidth, y + imageHeight - cornerRadius);
    ctx.quadraticCurveTo(x + imageWidth, y + imageHeight, x + imageWidth - cornerRadius, y + imageHeight);
    ctx.lineTo(x + cornerRadius, y + imageHeight);
    ctx.quadraticCurveTo(x, y + imageHeight, x, y + imageHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    
    ctx.clip();
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.restore();
    
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, imageWidth, imageHeight);
  }
}

async function drawBubblyTemplate(shots) {
  const cornerRadius = 30;
  const borderSize = 10;
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.save();
    ctx.fillStyle = "#ffe4e1";
    ctx.beginPath();
    ctx.moveTo(x - borderSize + cornerRadius, y - borderSize);
    ctx.lineTo(x - borderSize + imageWidth + borderSize - cornerRadius, y - borderSize);
    ctx.quadraticCurveTo(x - borderSize + imageWidth + borderSize, y - borderSize, x - borderSize + imageWidth + borderSize, y - borderSize + cornerRadius);
    ctx.lineTo(x - borderSize + imageWidth + borderSize, y - borderSize + imageHeight + borderSize - cornerRadius);
    ctx.quadraticCurveTo(x - borderSize + imageWidth + borderSize, y - borderSize + imageHeight + borderSize, x - borderSize + imageWidth + borderSize - cornerRadius, y - borderSize + imageHeight + borderSize);
    ctx.lineTo(x - borderSize + cornerRadius, y - borderSize + imageHeight + borderSize);
    ctx.quadraticCurveTo(x - borderSize, y - borderSize + imageHeight + borderSize, x - borderSize, y - borderSize + imageHeight + borderSize - cornerRadius);
    ctx.lineTo(x - borderSize, y - borderSize + cornerRadius);
    ctx.quadraticCurveTo(x - borderSize, y - borderSize, x - borderSize + cornerRadius, y - borderSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + imageWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + imageWidth, y, x + imageWidth, y + cornerRadius);
    ctx.lineTo(x + imageWidth, y + imageHeight - cornerRadius);
    ctx.quadraticCurveTo(x + imageWidth, y + imageHeight, x + imageWidth - cornerRadius, y + imageHeight);
    ctx.lineTo(x + cornerRadius, y + imageHeight);
    ctx.quadraticCurveTo(x, y + imageHeight, x, y + imageHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.restore();
  }
}

async function drawRusticTemplate(shots) {
  const border = 15;
  const innerBorder = 5;
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x - border, y - border, imageWidth + border * 2, imageHeight + border * 2);
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - border + innerBorder, y - border + innerBorder, imageWidth + (border - innerBorder) * 2, imageHeight + (border - innerBorder) * 2);
    
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
  }
}

async function drawDreamyTemplate(shots) {
  const softBorder = 15;
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.save();
    ctx.shadowColor = "rgba(255, 182, 193, 0.6)";
    ctx.shadowBlur = 15;
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.restore();
    
    ctx.strokeStyle = "rgba(255, 182, 193, 0.8)";
    ctx.lineWidth = softBorder;
    ctx.strokeRect(x, y, imageWidth, imageHeight);
  }
}

async function drawWhimsicalTemplate(shots) {
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.save();
    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let j = 0; j < imageWidth; j += 20) {
      ctx.moveTo(x + j, y);
      ctx.arc(x + j + 10, y, 10, Math.PI, 2 * Math.PI);
    }
    for (let j = 0; j < imageWidth; j += 20) {
      ctx.moveTo(x + j, y + imageHeight);
      ctx.arc(x + j + 10, y + imageHeight, 10, 0, Math.PI);
    }
    for (let j = 0; j < imageHeight; j += 20) {
      ctx.moveTo(x, y + j);
      ctx.arc(x, y + j + 10, 10, 1.5 * Math.PI, 0.5 * Math.PI);
    }
    for (let j = 0; j < imageHeight; j += 20) {
      ctx.moveTo(x + imageWidth, y + j);
      ctx.arc(x + imageWidth, y + j + 10, 10, 0.5 * Math.PI, 1.5 * Math.PI);
    }
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(x, y, imageWidth, imageHeight);
    ctx.clip();
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.restore();
  }
}

async function drawPlayfulTemplate(shots) {
  const borderSize = 10;
  const canvasElem = document.getElementById("collage-canvas");
  const ctx = canvasElem.getContext("2d");
  
  for (let i = 0; i < 4; i++) {
    if (!shots[i]) continue;
    const img = await loadImage(shots[i]);
    const y = verticalGap + i * (imageHeight + verticalGap);
    const x = horizontalMargin;
    
    ctx.save();
    ctx.fillStyle = "#ffebcd";
    ctx.fillRect(x - borderSize, y - borderSize, imageWidth + borderSize * 2, imageHeight + borderSize * 2);
    
    ctx.fillStyle = "#ffa07a";
    for (let j = x - borderSize; j < x + imageWidth + borderSize; j += 20) {
      for (let k = y - borderSize; k < y + imageHeight + borderSize; k += 20) {
        ctx.beginPath();
        ctx.arc(j, k, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.drawImage(img, x, y, imageWidth, imageHeight);
    ctx.restore();
  }
}

// -----------------------------
// Branding Function (Works for both Grid and Classic modes)
// -----------------------------
async function addBranding(canvas, ctx) {
  let reserved, cWidth, cHeight;
  if (currentTemplate === "grid") {
    reserved = gridReservedBottom;
    cWidth = gridCanvasWidth;
    cHeight = gridCanvasHeight;
  } else {
    reserved = reservedBottom;
    cWidth = canvasWidth;
    cHeight = canvasHeight;
  }
  const bottomY = cHeight - reserved / 2;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Removed the white fill and gradient overlay so that the branding area
  // matches the already drawn background
  
  try {
    const novaLogoImg = await loadImage("images/nova_logo_test_2.png");
    const logoWidth = currentTemplate === "grid" ? 300 : 300;
    const logoHeight = currentTemplate === "grid" ? 200 : 300;
    const logoX = (cWidth - logoWidth) / 2;
    const logoY = cHeight - reserved / 2 - logoHeight / 2;
    ctx.drawImage(novaLogoImg, logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    ctx.font = "bold 32px 'Playfair Display', serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("NOVA PHOTO", cWidth / 2, bottomY + 30);
  }
  
  ctx.font = "bold 16px Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText(currentDate, cWidth - 60, cHeight -10); // 10px margin from right and bottom
}


// -----------------------------
// Main Collage Function: createPhotoStrip
// -----------------------------
async function createPhotoStrip() {
  const canvas = document.getElementById("collage-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  // Set canvas dimensions based on the current template
  if (currentTemplate === "grid") {
    canvas.width = gridCanvasWidth;
    canvas.height = gridCanvasHeight;
  } else {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Retrieve the preview background choice (default to white)
  let previewBg = localStorage.getItem("photoBg") || "white";
  
  // Draw background based on previewBg value
  if (previewBg === "floral") {
    const floralImg = await loadImage(`https://via.placeholder.com/${canvas.width}x${canvas.height}?text=Floral`);
    ctx.drawImage(floralImg, 0, 0, canvas.width, canvas.height);
  } else if (previewBg === "pastel") {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#FFDEE9");
    gradient.addColorStop(1, "#B5FFFC");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (previewBg === "polka") {
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffcce6";
    const dotSize = 15;
    const spacing = 40;
    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (previewBg === "abstract") {
    let radialGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width);
    radialGradient.addColorStop(0, "#ff9a9e");
    radialGradient.addColorStop(0.5, "#fad0c4");
    radialGradient.addColorStop(1, "#fad0c4");
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (previewBg === "kirby") {
    const kirbyImg = await loadImage(`https://via.placeholder.com/${canvas.width}x${canvas.height}?text=Kirby+Theme`);
    ctx.drawImage(kirbyImg, 0, 0, canvas.width, canvas.height);
  } else if (previewBg === "snow") {
    ctx.fillStyle = "#e0f7ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 100; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      let radius = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (previewBg === "90s") {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#ff00ff");
    gradient.addColorStop(1, "#00ffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  } else if (previewBg === "bears") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const bearImg = await loadImage("https://via.placeholder.com/100x150?text=Bear");
    ctx.drawImage(bearImg, 10, canvas.height / 2 - 75, 100, 150);
    ctx.drawImage(bearImg, canvas.width - 110, canvas.height / 2 - 75, 100, 150);
  } else if (previewBg === "love") {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#ffcccc");
    gradient.addColorStop(1, "#ff6666");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 20; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      ctx.fillText("❤️", x, y);
    }
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Retrieve or create photo shots
  let shots = JSON.parse(localStorage.getItem("photoShots")) || [];
  if (shots.length === 0) {
    if (currentTemplate === "grid") {
      for (let i = 0; i < 4; i++) {
        shots.push(`https://via.placeholder.com/${Math.round(gridImageWidth)}x${gridImageHeight}?text=Photo+${i+1}`);
      }
    } else {
      for (let i = 0; i < 4; i++) {
        shots.push(`https://via.placeholder.com/${imageWidth}x${imageHeight}?text=Photo+${i+1}`);
      }
    }
    localStorage.setItem("photoShots", JSON.stringify(shots));
  }
  
  // Draw the collage using the selected template
  if (currentTemplate === "classic") {
    await drawClassicTemplate(shots, canvas, ctx);
  } else if (currentTemplate === "grid") {
    await drawGridTemplate(shots, canvas, ctx);
  } else if (currentTemplate === "polaroid") {
    await drawPolaroidTemplate(shots);
  } else if (currentTemplate === "vintage") {
    await drawVintageTemplate(shots);
  } else if (currentTemplate === "modern") {
    await drawModernTemplate(shots);
  } else if (currentTemplate === "bubbly") {
    await drawBubblyTemplate(shots);
  } else if (currentTemplate === "rustic") {
    await drawRusticTemplate(shots);
  } else if (currentTemplate === "dreamy") {
    await drawDreamyTemplate(shots);
  } else if (currentTemplate === "whimsical") {
    await drawWhimsicalTemplate(shots);
  } else if (currentTemplate === "playful") {
    await drawPlayfulTemplate(shots);
  } else {
    await drawClassicTemplate(shots, canvas, ctx);
  }
  
  // Add branding: use grid branding if in grid mode; otherwise, use default branding
  if (currentTemplate === "grid") {
    await addGridBranding(canvas, ctx);
  } else {
    await addBranding(canvas, ctx);
  }
  
  // Restart drop animation
  canvas.classList.remove("animate-drop");
  void canvas.offsetWidth;
  canvas.classList.add("animate-drop");
}


// -----------------------------
// Sticker Management Functions
// -----------------------------
let stickers = [];
let previewStickerContainer = document.getElementById("preview-sticker-container");
if (!previewStickerContainer) {
  previewStickerContainer = document.createElement("div");
  previewStickerContainer.id = "preview-sticker-container";
  previewStickerContainer.style.position = "absolute";
  previewStickerContainer.style.top = "0";
  previewStickerContainer.style.left = "0";
  previewStickerContainer.style.width = "100%";
  previewStickerContainer.style.height = "100%";
  document.getElementById("collage-wrapper").appendChild(previewStickerContainer);
}

function addPreviewSticker(stickerChar) {
  const sticker = document.createElement("div");
  sticker.classList.add("preview-sticker");
  sticker.textContent = stickerChar;
  
  const stickerSize = 60;
  const wrapperRect = document.getElementById("collage-wrapper").getBoundingClientRect();
  const scale = (currentTemplate === "grid" ? gridCanvasHeight : canvasHeight) / wrapperRect.height;
  
  const stickerObj = {
    element: sticker,
    char: stickerChar,
    x: (currentTemplate === "grid" ? gridCanvasWidth : canvasWidth) / 2 - stickerSize / 2,
    y: (currentTemplate === "grid" ? gridCanvasHeight : canvasHeight) / 2 - stickerSize / 2,
    size: stickerSize
  };
  
  sticker.style.position = "absolute";
  sticker.style.left = (stickerObj.x / scale) + "px";
  sticker.style.top = (stickerObj.y / scale) + "px";
  sticker.style.fontSize = (stickerObj.size / scale) + "px";
  sticker.style.cursor = "move";
  sticker.style.userSelect = "none";
  sticker.style.pointerEvents = "auto";
  
  previewStickerContainer.appendChild(sticker);
  stickers.push(stickerObj);
  
  makeDraggableSticker(sticker, stickerObj, scale);
}

function makeDraggableSticker(el, stickerObj, scale) {
  let isDragging = false;
  let startX, startY;
  
  el.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    el.style.zIndex = 1000;
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  
  el.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    stickerObj.x += dx * scale;
    stickerObj.y += dy * scale;
    
    const activeWidth = currentTemplate === "grid" ? gridCanvasWidth : canvasWidth;
    const activeHeight = currentTemplate === "grid" ? gridCanvasHeight : canvasHeight;
    
    const maxX = activeWidth - stickerObj.size;
    const maxY = activeHeight - stickerObj.size;
    stickerObj.x = Math.max(0, Math.min(maxX, stickerObj.x));
    stickerObj.y = Math.max(0, Math.min(maxY, stickerObj.y));
    
    el.style.left = (stickerObj.x / scale) + "px";
    el.style.top = (stickerObj.y / scale) + "px";
    
    startX = e.clientX;
    startY = e.clientY;
  });
  
  el.addEventListener("pointerup", (e) => {
    isDragging = false;
    el.releasePointerCapture(e.pointerId);
  });
  
  el.addEventListener("dblclick", () => {
    stickerObj.size = stickerObj.size === 60 ? 90 : stickerObj.size === 90 ? 120 : 60;
    el.style.fontSize = (stickerObj.size / scale) + "px";
  });
}

// -----------------------------
// Event Listeners for Buttons and Templates
// -----------------------------
document.addEventListener('DOMContentLoaded', async function() {

  const collageWrapper = document.getElementById("collage-wrapper");
  const canvas = document.getElementById("collage-canvas");
  if (!canvas) {
    return;
  }
  
  let previewBg = localStorage.getItem("photoBg") || "white";
  currentTemplate = localStorage.getItem("photoTemplate") || currentTemplate;
  
  document.querySelectorAll(".preview-sticker-btn").forEach(button => {
    button.addEventListener("click", () => {
      const stickerChar = button.getAttribute("data-sticker");
      addPreviewSticker(stickerChar);
    });
  });
  
  const templateButtons = document.querySelectorAll(".template-btn");
  templateButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentTemplate = button.getAttribute("data-template");
      localStorage.setItem("photoTemplate", currentTemplate);
      templateButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (currentTemplate === "grid") {
        collageWrapper.classList.add("grid-layout");
      } else {
        collageWrapper.classList.remove("grid-layout");
      }

      createPhotoStrip();
    });
  });
  
  document.querySelectorAll(".preview-bg-btn").forEach(button => {
    button.addEventListener("click", () => {
      previewBg = button.getAttribute("data-bg");
      localStorage.setItem("photoBg", previewBg);
      createPhotoStrip();
    });
  });
  
  const downloadButton = document.getElementById("download");
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      createPhotoStrip().then(() => {
        mergeStickers();
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "NOVA_PhotoStrip_" + new Date().toISOString().split("T")[0] + ".png";
        link.click();
      });
    });
  }
  
  const nextButton = document.getElementById("next-btn");
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      window.location.href = "booth.html";
    });
  }
  
  const clearStickersButton = document.getElementById("clear-stickers");
  if (clearStickersButton) {
    clearStickersButton.addEventListener("click", () => {
      stickers = [];
      while (previewStickerContainer.firstChild) {
        previewStickerContainer.removeChild(previewStickerContainer.firstChild);
      }
    });
  }
  
  window.addEventListener('resize', function() {
    const wrapperRect = document.getElementById("collage-wrapper").getBoundingClientRect();
    const scale = (currentTemplate === "grid" ? gridCanvasHeight : canvasHeight) / wrapperRect.height;
    stickers.forEach(sticker => {
      sticker.element.style.left = (sticker.x / scale) + "px";
      sticker.element.style.top = (sticker.y / scale) + "px";
      sticker.element.style.fontSize = (sticker.size / scale) + "px";
    });
  });
  
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("photoShots");
  });
  
  createPhotoStrip();
});

// Function to merge stickers onto the canvas before download
function mergeStickers() {
  const canvas = document.getElementById("collage-canvas");
  const ctx = canvas.getContext("2d");
  stickers.forEach(sticker => {
    ctx.font = `${sticker.size}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(sticker.char, sticker.x, sticker.y);
  });
}

async function addGridBranding(canvas, ctx) {
  const reserved = gridReservedBottom; // 180
  const cWidth = gridCanvasWidth;       // 1300
  const cHeight = gridCanvasHeight;     // 1800

  // Use your measurements for grid mode:
  const logoWidth = currentTemplate === "grid" ? 400 : 400;
  const logoHeight = currentTemplate === "grid" ? 400 : 400;

  try {
    const novaLogoImg = await loadImage("images/nova_logo_test_2.png");
    // Center the logo horizontally and position it vertically within the reserved area.
    const logoX = (cWidth - logoWidth) / 2;
    const logoY = cHeight - reserved / 2 - logoHeight / 2;
    ctx.drawImage(novaLogoImg, logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    // Fallback: display a text placeholder if the logo fails to load.
    ctx.font = "bold 32px 'Playfair Display', serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("NOVA PHOTO", cWidth / 2, cHeight - reserved / 2 + 30);
  }
  
  // Draw the date in bold at the bottom right of the photo strip.
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  ctx.font = "bold 40px Arial, sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(currentDate, cWidth - 10, cHeight - 10); // 10px margin from right and bottom
}

