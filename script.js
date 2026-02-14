const plate1x1Colors = [
  "#009894", // Bright Bluish Green
  "#e2f99a", // Spring Yellowish Green
  "#d3f2ea", // Aqua
  "#cda4de", // Lavender
  "#720012", // New Dark Red
  "#5f3109", // Reddish Brown
  "#000001", // Black
  "#ca4c0b", // Reddish Orange
  "#77774e", // Olive Green
  "#441a91", // Medium Lilac
  "#372100", // Dark Brown
  "#897d62", // Sand Yellow
  "#1e5aa8", // Bright Blue
  "#70819a", // Sand Blue
  "#b40000", // Bright Red
  "#ffec6c", // Cool Yellow
  "#bb805a", // Nougat
  "#00852b", // Dark Green
  "#7396c8", // Medium Blue
  "#91501c", // Dark Orange
  "#969696", // Medium Stone Grey
  "#ffff00", // Vibrant Yellow
  "#a06eb9", // Medium Lavender
  "#901f76", // Bright Reddish Violet
  "#e1bea1", // Light Nougat
  "#58ab41", // Bright Green
  "#fcac00", // Flame Yellowish Orange
  "#d67923", // Bright Orange
  "#fac80a", // Bright Yellow
  "#c8509b", // Bright Purple
  "#f06d78", // Vibrant Coral
  "#a5ca18", // Bright Yellowish Green
  "#68c3e2", // Medium Azur
  "#ff9ecd", // Light Purple
  "#469bc3", // Dark Azur
  "#9dc3f7", // Light Royal Blue
  "#708e7c", // Sand Green
  "#aa7d55", // Medium Nougat
  "#f4f4f4", // White
  "#ccb98d", // Brick Yellow
  "#19325a", // Earth Blue
  "#00451a", // Earth Green
  "#646464"  // Dark Stone Grey
];


const tile1x1Colors = [
  "#009894", // Bright Bluish Green
  "#e2f99a", // Spring Yellowish Green
  "#d3f2ea", // Aqua
  "#cda4de", // Lavender
  "#000001", // Black
  "#720012", // New Dark Red
  "#5f3109", // Reddish Brown
  "#ca4c0b", // Reddish Orange
  "#77774e", // Olive Green
  "#441a91", // Medium Lilac
  "#372100", // Dark Brown
  "#897d62", // Sand Yellow
  "#1e5aa8", // Bright Blue
  "#70819a", // Sand Blue
  "#b40000", // Bright Red
  "#ffec6c", // Cool Yellow
  "#bb805a", // Nougat
  "#00852b", // Dark Green
  "#7396c8", // Medium Blue
  "#91501c", // Dark Orange
  "#969696", // Medium Stone Grey
  "#ffff00", // Vibrant Yellow
  "#a06eb9", // Medium Lavender
  "#901f76", // Bright Reddish Violet
  "#e1bea1", // Light Nougat
  "#fac80a", // Bright Yellow
  "#58ab41", // Bright Green
  "#d67923", // Bright Orange
  "#fcac00", // Flame Yellowish Orange
  "#c8509b", // Bright Purple
  "#f06d78", // Vibrant Coral
  "#a5ca18", // Bright Yellowish Green
  "#68c3e2", // Medium Azur
  "#ff9ecd", // Light Purple
  "#469bc3", // Dark Azur
  "#9dc3f7", // Light Royal Blue
  "#708e7c", // Sand Green
  "#aa7d55", // Medium Nougat
  "#ccb98d", // Brick Yellow
  "#f4f4f4", // White
  "#19325a", // Earth Blue
  "#00451a", // Earth Green
  "#646464"  // Dark Stone Grey
];


function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function colorDistance(c1, c2) {
    return Math.sqrt(
        (c1.r - c2.r) ** 2 +
        (c1.g - c2.g) ** 2 +
        (c1.b - c2.b) ** 2
    );
}

const paletteRGB = plate1x1Colors.map(hexToRgb);

function getClosestColor(pixel) {
    let minDistance = Infinity;
    let closest = paletteRGB[0];
    for (const color of paletteRGB) {
        const distance = colorDistance(pixel, color);
        if (distance < minDistance) {
            minDistance = distance;
            closest = color;
        }
    }
    return closest;
}

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const uploadInput = document.getElementById("upload");
const resizeBtn = document.getElementById("resizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");
const keepRatioCheckbox = document.getElementById("keepRatio");
const colorSlider = document.getElementById("colorSlider");
const colorCountLabel = document.getElementById("colorCountLabel");

colorSlider.addEventListener("input", () => {
    colorCountLabel.textContent = colorSlider.value;
    // Recalculate image if loaded
    if (originalImage) {
        resizeImage();
    }
});

let originalImage = null;
let resizedImageURL = null;

function resizeImage() {
    if (!originalImage) {
        alert("Please upload an image first.");
        return;
    }
    let targetWidth = parseInt(widthInput.value);
    let targetHeight = parseInt(heightInput.value);
    const keepAspect = keepRatioCheckbox.checked;
    // If keep aspect ratio, adjust height or width
    if (keepAspect) {
        const aspect = originalImage.width / originalImage.height;
        if (!targetWidth && targetHeight) {
            targetWidth = Math.round(targetHeight * aspect);
            widthInput.value = targetWidth;
        } else if (targetWidth && !targetHeight) {
            targetHeight = Math.round(targetWidth / aspect);
            heightInput.value = targetHeight;
        } else if (targetWidth && targetHeight) {
            // Adjust one to match aspect ratio
            if (Math.abs(targetWidth / targetHeight - aspect) > 0.01) {
                targetHeight = Math.round(targetWidth / aspect);
                heightInput.value = targetHeight;
            }
        } else {
            // Default to original size
            targetWidth = originalImage.width;
            targetHeight = originalImage.height;
        }
    } else {
        // If neither width nor height specified, use original
        if (!targetWidth && !targetHeight) {
            targetWidth = originalImage.width;
            targetHeight = originalImage.height;
        }
    }
    const MAX_COLORS = parseInt(colorSlider.value);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    // STEP 1: Count palette usage frequency
    const paletteUsage = new Map();
    for (let i = 0; i < data.length; i += 4) {
        const pixel = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };
        const closest = getClosestColor(pixel);
        const key = `${closest.r},${closest.g},${closest.b}`;
        paletteUsage.set(key, (paletteUsage.get(key) || 0) + 1);
    }
    // STEP 2: Sort by frequency and limit to MAX_COLORS
    const limitedPalette = [...paletteUsage.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_COLORS)
        .map(entry => {
            const [r, g, b] = entry[0].split(",").map(Number);
            return { r, g, b };
        });
    // STEP 3: Re-map pixels using limited palette only
    function getClosestFromLimited(pixel) {
        let minDistance = Infinity;
        let closest = limitedPalette[0];
        for (const color of limitedPalette) {
            const distance = colorDistance(pixel, color);
            if (distance < minDistance) {
                minDistance = distance;
                closest = color;
            }
        }
        return closest;
    }
    for (let i = 0; i < data.length; i += 4) {
        const pixel = {
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        };
        const closest = getClosestFromLimited(pixel);
        data[i] = closest.r;
        data[i + 1] = closest.g;
        data[i + 2] = closest.b;
    }
    ctx.putImageData(imageData, 0, 0);
    resizedImageURL = canvas.toDataURL("image/png");
    preview.src = resizedImageURL;
    preview.style.width = `${targetWidth * 10}px`;
    preview.style.height = `${targetHeight * 10}px`;
    preview.style.imageRendering = "pixelated";
    downloadBtn.style.display = "block";
}

uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        originalImage = new Image();
        originalImage.onload = () => {
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

resizeBtn.addEventListener("click", () => {
    resizeImage();
});

downloadBtn.addEventListener("click", () => {
    if (!resizedImageURL) return;
    const link = document.createElement("a");
    link.href = resizedImageURL;
    link.download = "resized-image.jpg";
    link.click();
});
