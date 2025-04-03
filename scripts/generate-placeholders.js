const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const categories = ['social', 'merch', 'branding', 'marketing', 'web', 'print'];
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate a placeholder image
function generatePlaceholder(width, height, text, category) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);

  // Category text
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(category, width / 2, height / 2);

  // Example text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.fillText(text, width / 2, height / 2 + 30);

  return canvas;
}

// Generate placeholders for each category
categories.forEach(category => {
  for (let i = 1; i <= 3; i++) {
    const canvas = generatePlaceholder(800, 600, `Example ${i}`, category);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, `${category}-${i}.jpg`), buffer);
    console.log(`Generated placeholder for ${category}-${i}.jpg`);
  }
});

console.log('All placeholder images generated successfully!'); 