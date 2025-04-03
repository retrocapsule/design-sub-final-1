export interface Example {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  details: {
    process: string[];
    tools: string[];
    timeline: string;
    results: string[];
  };
}

export const examples: Example[] = [
  // Social Media Examples
  {
    id: "social-1",
    title: "Instagram Posts",
    description: "Engaging social media content that drives engagement and grows your following.",
    image: "/images/examples/instagram_post_example.png",
    category: "social",
    details: {
      process: [
        "Client submits post topic, text, and any assets",
        "AI generates initial post graphics based on input",
        "Internal quality check ensures visual appeal and brand alignment",
        "Post graphics delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom post graphics tailored for engagement",
        "Professionally crafted visuals optimized for Instagram's feed",
        "Ready-to-use image files (JPG/PNG)"
      ]
    }
  },
  {
    id: "social-2",
    title: "Story Highlights",
    description: "Custom story templates that maintain brand consistency across Instagram stories.",
    image: "/images/examples/story_highlight_example.png",
    category: "social",
    details: {
      process: [
        "Client submits brand elements and style preferences",
        "AI generates initial story highlight cover designs",
        "Internal quality check ensures brand consistency",
        "Highlight covers delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom story highlight covers",
        "Professionally crafted icons for brand consistency",
        "Ready-to-use image files optimized for Instagram Stories"
      ]
    }
  },
  {
    id: "social-3",
    title: "Carousel Posts",
    description: "Multi-slide content that tells your story and drives engagement.",
    image: "/images/examples/carousel_post_example.png",
    category: "social",
    details: {
      process: [
        "Client submits content outline and assets for carousel",
        "AI generates initial multi-slide carousel graphics",
        "Internal quality check ensures flow and visual consistency",
        "Carousel graphics delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom carousel post design",
        "Professionally crafted multi-slide visuals for storytelling",
        "Ready-to-use image files (JPG/PNG) for each slide"
      ]
    }
  },

  // Merch Examples
  {
    id: "merch-1",
    title: "T-Shirt Design",
    description: "Premium streetwear designs that stand out and sell.",
    image: "/images/examples/tshirt_design_example.png",
    category: "merch",
    details: {
      process: [
        "Client submits design concept, style, and any text/graphics",
        "AI generates initial t-shirt graphic concepts",
        "Internal quality check ensures design quality and print readiness",
        "T-shirt graphic delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom t-shirt graphic",
        "Professionally crafted visuals suitable for apparel printing",
        "Print-ready vector or high-resolution raster files"
      ]
    }
  },
  {
    id: "merch-2",
    title: "Hoodie Design",
    description: "Premium streetwear hoodie designs with unique artwork.",
    image: "/images/examples/hoodie_design_example.png",
    category: "merch",
    details: {
      process: [
        "Client submits design concept, style, and placement ideas",
        "AI generates initial hoodie graphic concepts",
        "Internal quality check ensures design quality and print feasibility",
        "Hoodie graphic delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom hoodie graphic",
        "Professionally crafted visuals designed for hoodies",
        "Print-ready vector or high-resolution raster files"
      ]
    }
  },
  {
    id: "merch-3",
    title: "Accessories",
    description: "Matching accessories that complete your merch collection.",
    image: "/images/examples/accessories_example.png",
    category: "merch",
    details: {
      process: [
        "Client submits accessory type and design requirements",
        "AI generates initial accessory design concepts",
        "Internal quality check ensures design suitability for the product",
        "Accessory design delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom designs for accessories (hats, bags, etc.)",
        "Professionally crafted visuals adapted for specific products",
        "Print-ready files suitable for accessory production"
      ]
    }
  },

  // Branding Examples
  {
    id: "branding-1",
    title: "Logo Design",
    description: "Professional logo designs that capture your brand essence.",
    image: "/images/examples/logo_design_example.png",
    category: "branding",
    details: {
      process: [
        "Client submits brand name, industry, style preferences, and ideas",
        "AI generates a diverse range of initial logo concepts",
        "Internal review and refinement for uniqueness and quality",
        "Logo options delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently to finalize the chosen logo"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator (for vectorization)"],
      timeline: "1-3 business days",
      results: [
        "Unique, high-quality custom logo",
        "Professionally crafted brand mark representing your business",
        "Vector files (SVG, AI, EPS) and raster files (JPG, PNG) for web/print"
      ]
    }
  },
  {
    id: "branding-2",
    title: "Brand Guidelines",
    description: "Comprehensive brand guidelines that ensure consistency.",
    image: "/images/examples/brand_guidelines_example.png",
    category: "branding",
    details: {
      process: [
        "Client provides existing logo, color palette, and font information",
        "AI assists in structuring the guideline document layout",
        "Content (rules for usage, examples) compiled and reviewed internally",
        "Comprehensive guide delivered quickly (typically within 1-3 days)",
        "Updates processed efficiently if needed"
      ],
      tools: ["AI Content Tools", "Adobe Photoshop", "Adobe InDesign/Figma"],
      timeline: "1-3 business days",
      results: [
        "Clear, concise brand guidelines document (PDF)",
        "Rules for logo usage, typography, colors, and imagery",
        "Professionally formatted guide ensuring brand consistency"
      ]
    }
  },
  {
    id: "branding-3",
    title: "Brand Assets",
    description: "Complete brand asset package for all your needs.",
    image: "/images/examples/brand_assets_example.png",
    category: "branding",
    details: {
      process: [
        "Client specifies required assets (e.g., letterhead, social templates) and provides brand guidelines/elements",
        "AI generates initial designs for requested assets",
        "Internal quality check ensures consistency with brand guidelines",
        "Asset package delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator/InDesign"],
      timeline: "1-3 business days",
      results: [
        "Cohesive set of custom brand assets (digital and/or print)",
        "Professionally designed materials reflecting your brand identity",
        "Ready-to-use files in appropriate formats"
      ]
    }
  },

  // Marketing Examples
  {
    id: "marketing-1",
    title: "Email Campaigns",
    description: "Engaging email designs that drive conversions.",
    image: "/images/examples/email_campaign_example.png",
    category: "marketing",
    details: {
      process: [
        "Client submits campaign goals, target audience, and email content/copy",
        "AI generates initial email template designs",
        "Internal quality check for visual appeal and mobile responsiveness",
        "Email design delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom email template design",
        "Professionally crafted visuals optimized for email platforms",
        "HTML or image files ready for use in email marketing software"
      ]
    }
  },
  {
    id: "marketing-2",
    title: "Advertising Creatives",
    description: "Eye-catching ads optimized for performance.",
    image: "/images/examples/ad_banner_example.png",
    category: "marketing",
    details: {
      process: [
        "Client submits ad goals, target audience, platform, and ad copy/specs",
        "AI generates initial ad creative concepts in required sizes",
        "Internal quality check ensures compliance and visual impact",
        "Ad creatives delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom ad creatives (static or animated)",
        "Professionally designed visuals optimized for clicks and conversions",
        "Ready-to-use files in required ad platform formats and dimensions"
      ]
    }
  },
  {
    id: "marketing-3",
    title: "Landing Page Design",
    description: "High-converting landing pages designed for results.",
    image: "/images/examples/landing_page_example.png",
    category: "marketing",
    details: {
      process: [
        "Client submits conversion goals, target audience, and page content/structure",
        "AI generates initial landing page design concepts/layouts",
        "Internal review for user experience (UX) and conversion focus",
        "Landing page design assets delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Figma"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom landing page design mockups",
        "Professionally crafted visuals focused on conversion goals",
        "Design files (e.g., Figma, PSD) ready for development"
      ]
    }
  },

  // Print Examples
  {
    id: "print-1",
    title: "Business Cards",
    description: "Professional business cards that make an impression.",
    image: "/images/examples/business_card_example.png",
    category: "print",
    details: {
      process: [
        "Client submits contact info, logo, and any brand elements/style preferences",
        "AI generates initial business card layout options",
        "Internal quality check ensures information accuracy and print standards",
        "Print-ready design delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom business card design",
        "Professionally crafted layout reflecting brand identity",
        "Print-ready PDF file with bleed and trim marks"
      ]
    }
  },
  {
    id: "print-2",
    title: "Brochure Design",
    description: "Informative and visually appealing brochures.",
    image: "/images/examples/brochure_design_example.png",
    category: "print",
    details: {
      process: [
        "Client submits brochure text content, images, and folding requirements",
        "AI generates initial brochure layouts and visual concepts",
        "Internal review for readability, information flow, and print standards",
        "Print-ready design delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe InDesign"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom brochure design (bi-fold, tri-fold, etc.)",
        "Professionally crafted layout for effective information delivery",
        "Print-ready PDF file with proper setup for printing"
      ]
    }
  },
  {
    id: "print-3",
    title: "Posters",
    description: "Eye-catching posters for events or promotions.",
    image: "/images/examples/poster_example.png",
    category: "print",
    details: {
      process: [
        "Client submits poster text, desired dimensions, and visual direction",
        "AI generates initial poster design concepts",
        "Internal quality check ensures visual impact and print quality",
        "Print-ready design delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "Adobe Illustrator"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom poster design",
        "Professionally crafted visuals designed for visibility and impact",
        "Print-ready file (PDF/JPG) in specified dimensions"
      ]
    }
  },

  // Web Examples
  {
    id: "web-1",
    title: "Website design",
    description: "Engaging web design that drives clicks.",
    image: "/images/examples/website_design_example.png",
    category: "web",
    details: {
      process: [
        "Client submits banner dimensions, text, call-to-action, and visual ideas",
        "AI generates initial web banner designs in various sizes if needed",
        "Internal quality check ensures visual appeal and file size optimization",
        "Banner files delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom web banner designs",
        "Professionally crafted visuals optimized for web display and clicks",
        "Ready-to-use files in standard web formats (JPG, PNG, GIF)"
      ]
    }
  },
  {
    id: "web-2",
    title: "Landing Page Design",
    description: "Professional landing page design that drives clicks.",
    image: "/images/examples/landing_page_example.png",
    category: "web",
    details: {
      process: [
        "Client submits platform (Facebook, Twitter, etc.), brand elements, and visual ideas",
        "AI generates initial cover photo options optimized for the platform",
        "Internal quality check ensures correct dimensions and visual appeal",
        "Cover photos delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom social media cover photo designs",
        "Professionally crafted visuals representing your brand online",
        "Ready-to-use image files optimized for specific social media platforms"
      ]
    }
  },
  {
    id: "web-3",
    title: "UI components",
    description: "Visually stunning UI components that captivate.",
    image: "/images/examples/ui_components_example.png",
    category: "web",
    details: {
      process: [
        "Client submits presentation content (text, data) and style preferences",
        "AI generates initial slide designs or a full presentation template",
        "Internal review for clarity, consistency, and visual engagement",
        "Design/template delivered quickly (typically within 1-3 days)",
        "Revisions processed efficiently if needed"
      ],
      tools: ["AI Design Tools", "Adobe Photoshop", "PowerPoint/Keynote/Google Slides"],
      timeline: "1-3 business days",
      results: [
        "High-quality custom presentation design or template",
        "Professionally crafted visuals for effective communication",
        "Editable presentation file (PPTX, KEY, Google Slides) or template"
      ]
    }
  }
]; 