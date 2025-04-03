const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const caseStudies = [
  {
    id: 'ecommerce',
    title: 'E-commerce Brands',
    images: ['ecommerce.jpg', 'ecommerce-1.jpg', 'ecommerce-2.jpg', 'ecommerce-3.jpg']
  },
  {
    id: 'artists',
    title: 'Artists & Musicians',
    images: ['artists.jpg', 'artists-1.jpg', 'artists-2.jpg', 'artists-3.jpg']
  },
  {
    id: 'agencies',
    title: 'Marketing Agencies',
    images: ['agencies.jpg', 'agencies-1.jpg', 'agencies-2.jpg', 'agencies-3.jpg']
  }
];

const caseStudiesDir = path.join(__dirname, '../public/case-studies');

// Ensure case studies directory exists
if (!fs.existsSync(caseStudiesDir)) {
  fs.mkdirSync(caseStudiesDir, { recursive: true });
}

// Generate a placeholder image
function generatePlaceholder(width, height, text, color) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas;
}

// Generate placeholders for each case study
caseStudies.forEach(caseStudy => {
  const colors = {
    main: '#4f46e5',
    gallery1: '#3b82f6',
    gallery2: '#6366f1',
    gallery3: '#8b5cf6'
  };

  // Main image
  const mainCanvas = generatePlaceholder(800, 450, `${caseStudy.title} Cover`, colors.main);
  fs.writeFileSync(path.join(caseStudiesDir, caseStudy.images[0]), mainCanvas.toBuffer('image/png'));
  console.log(`Generated ${caseStudy.images[0]}`);

  // Gallery images
  for (let i = 1; i <= 3; i++) {
    const canvas = generatePlaceholder(800, 450, `${caseStudy.title} Example ${i}`, colors[`gallery${i}`]);
    fs.writeFileSync(path.join(caseStudiesDir, caseStudy.images[i]), canvas.toBuffer('image/png'));
    console.log(`Generated ${caseStudy.images[i]}`);
  }
});

console.log('All case study images generated successfully!'); 