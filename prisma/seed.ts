import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create or update admin user
  const adminEmail = 'gorillaflix@gmail.com';
  const hashedPassword = await hash('admin123', 10); // You should change this password

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created/updated successfully');

  // Create default packages
  const packages = [
    {
      name: 'Basic',
      originalPrice: 199,
      price: 99,
      features: [
        'Unlimited design requests',
        'Unlimited revisions',
        '48-hour turnaround',
        '1 active request at a time',
        'Source files included'
      ],
      isActive: true,
    },
    {
      name: 'Pro',
      originalPrice: 399,
      price: 199,
      features: [
        'Unlimited design requests',
        'Unlimited revisions',
        '24-hour turnaround',
        '2 active requests at a time',
        'Source files included',
        'Dedicated project manager'
      ],
      isActive: true,
    },
    {
      name: 'Enterprise',
      originalPrice: 999,
      price: 499,
      features: [
        'Unlimited design requests',
        'Unlimited revisions',
        '24-hour turnaround',
        '5 active requests at a time',
        'Source files included',
        'Dedicated design team'
      ],
      isActive: true,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }

  // Create design templates
  const templates = [
    {
      name: 'Logo Design',
      description: 'Create a unique and memorable brand identity',
      icon: 'Palette',
      projectType: 'logo',
      fileFormat: 'ai',
      dimensions: 'logo-standard',
      defaultDescription: 'Looking for a modern, professional logo that represents our brand values. The logo should be versatile and work well across different mediums.',
    },
    {
      name: 'Social Media Campaign',
      description: 'Engaging visuals for your social media presence',
      icon: 'Image',
      projectType: 'social-media',
      fileFormat: 'png',
      dimensions: 'social-square',
      defaultDescription: 'Need a series of eye-catching social media posts for our upcoming campaign. Posts should be visually consistent and optimized for each platform.',
    },
    {
      name: 'Album Cover Art',
      description: 'Stunning artwork for your music release',
      icon: 'Music',
      projectType: 'cover-art',
      fileFormat: 'psd',
      dimensions: 'social-square',
      defaultDescription: 'Seeking a bold and creative album cover that captures the essence of our music. The design should stand out on streaming platforms.',
    },
    {
      name: 'Merchandise Design',
      description: 'Custom designs for your products',
      icon: 'Gift',
      projectType: 'apparel',
      fileFormat: 'ai',
      dimensions: 'custom',
      defaultDescription: 'Need designs for our merchandise line including t-shirts, hoodies, and accessories. Designs should be print-ready and work well on different materials.',
    },
    {
      name: 'Website Banner',
      description: 'Eye-catching banners for your website',
      icon: 'Globe',
      projectType: 'web-graphics',
      fileFormat: 'png',
      dimensions: 'banner-wide',
      defaultDescription: 'Looking for a modern, responsive banner design for our website homepage. The design should be engaging and convert visitors.',
    },
    {
      name: 'Email Newsletter',
      description: 'Professional email marketing templates',
      icon: 'Mail',
      projectType: 'social-media',
      fileFormat: 'html',
      dimensions: 'custom',
      defaultDescription: 'Need a clean, professional email newsletter template that works well across email clients. Should include header, content sections, and footer.',
    },
    {
      name: 'Product Packaging',
      description: 'Attractive packaging design for your products',
      icon: 'Box',
      projectType: 'packaging',
      fileFormat: 'ai',
      dimensions: 'custom',
      defaultDescription: 'Seeking a modern packaging design for our product line. The design should be both functional and visually appealing on store shelves.',
    },
    {
      name: 'Business Card',
      description: 'Professional business card design',
      icon: 'CreditCard',
      projectType: 'print',
      fileFormat: 'pdf',
      dimensions: 'print-letter',
      defaultDescription: 'Need a clean, professional business card design that matches our brand identity. Should include logo placement and contact information layout.',
    },
  ];

  for (const template of templates) {
    await prisma.designTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 