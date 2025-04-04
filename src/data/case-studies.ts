export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  results: {
    title: string;
    value: string;
    timeframe: string;
  };
  metrics: Array<{
    title: string;
    value: string;
    description: string;
  }>;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  process: Array<{
    title: string;
    description: string;
  }>;
  gallery: Array<{
    image: string;
    caption: string;
  }>;
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'E-commerce Redesign Success',
    description: 'Complete overhaul of an e-commerce platform resulting in improved user experience and increased sales.',
    image: '/Images/examples/website_design_example.png',
    category: 'E-commerce',
    results: {
      title: 'Revenue Growth',
      value: '150%',
      timeframe: '6 months'
    },
    metrics: [
      {
        title: 'Conversion Rate',
        value: '3.2%',
        description: 'Increased from 1.8%'
      },
      {
        title: 'Average Order Value',
        value: '$85',
        description: 'Increased from $65'
      },
      {
        title: 'Mobile Traffic',
        value: '65%',
        description: 'Of total traffic'
      }
    ],
    testimonial: {
      quote: "The redesign completely transformed our online presence. Our customers love the new experience, and our sales have skyrocketed.",
      author: "Sarah Johnson",
      role: "E-commerce Director"
    },
    process: [
      {
        title: "Discovery & Analysis",
        description: "Conducted user research and analyzed pain points in the existing platform"
      },
      {
        title: "UX Design",
        description: "Created intuitive user flows and wireframes focused on conversion"
      },
      {
        title: "Visual Design",
        description: "Developed a modern, trustworthy visual design system"
      },
      {
        title: "Implementation",
        description: "Seamless integration with existing systems and thorough testing"
      }
    ],
    gallery: [
      {
        image: "/Images/examples/landing_page_example.png",
        caption: "Homepage redesign with improved navigation"
      },
      {
        image: "/Images/examples/ui_components_example.png",
        caption: "Mobile-optimized product pages"
      },
      {
        image: "/Images/examples/app_interface_example.png",
        caption: "Streamlined checkout process"
      }
    ]
  },
  {
    id: '2',
    title: 'Brand Identity Transformation',
    description: 'Complete brand identity redesign for a tech startup, including logo, color scheme, and marketing materials.',
    image: '/Images/examples/logo_design_example.png',
    category: 'Branding',
    results: {
      title: 'Brand Recognition',
      value: '85%',
      timeframe: '3 months'
    },
    metrics: [
      {
        title: 'Social Media Engagement',
        value: '200%',
        description: 'Increased engagement rate'
      },
      {
        title: 'Customer Loyalty',
        value: '92%',
        description: 'Positive brand perception'
      },
      {
        title: 'Brand Recall',
        value: '78%',
        description: 'Among target audience'
      }
    ],
    testimonial: {
      quote: "Our new brand identity perfectly captures our company's vision and has helped us stand out in a crowded market.",
      author: "Michael Chen",
      role: "CEO, TechStart"
    },
    process: [
      {
        title: "Brand Strategy",
        description: "Defined brand positioning and target audience"
      },
      {
        title: "Visual Identity",
        description: "Created logo, color palette, and typography system"
      },
      {
        title: "Brand Guidelines",
        description: "Developed comprehensive brand usage guidelines"
      },
      {
        title: "Asset Creation",
        description: "Designed marketing materials and digital assets"
      }
    ],
    gallery: [
      {
        image: "/Images/examples/logo_design_example.png",
        caption: "Logo evolution and variations"
      },
      {
        image: "/Images/examples/brand_guidelines_example.png",
        caption: "Brand color palette and typography"
      },
      {
        image: "/Images/examples/brand_assets_example.png",
        caption: "Marketing materials showcase"
      }
    ]
  },
  {
    id: '3',
    title: 'Social Media Growth Campaign',
    description: 'Strategic social media design campaign that dramatically increased follower engagement and reach.',
    image: '/Images/examples/instagram_post_example.png',
    category: 'Social Media',
    results: {
      title: 'Follower Growth',
      value: '300%',
      timeframe: '3 months'
    },
    metrics: [
      {
        title: 'Engagement Rate',
        value: '12%',
        description: 'Up from 3% industry average'
      },
      {
        title: 'Content Reach',
        value: '1M+',
        description: 'Monthly impressions'
      },
      {
        title: 'Click-through Rate',
        value: '4.8%',
        description: 'Above industry average'
      }
    ],
    testimonial: {
      quote: "The social media campaign exceeded our expectations. The content design was spot-on and resonated perfectly with our audience.",
      author: "Emily Rodriguez",
      role: "Marketing Manager"
    },
    process: [
      {
        title: "Content Strategy",
        description: "Developed content themes and posting schedule"
      },
      {
        title: "Visual Design",
        description: "Created template system for consistent branding"
      },
      {
        title: "Content Creation",
        description: "Produced engaging visual content and stories"
      },
      {
        title: "Performance Analysis",
        description: "Monitored metrics and optimized content strategy"
      }
    ],
    gallery: [
      {
        image: "/Images/examples/instagram_post_example.png",
        caption: "Instagram feed design system"
      },
      {
        image: "/Images/examples/story_highlight_example.png",
        caption: "Story highlights and templates"
      },
      {
        image: "/Images/examples/carousel_post_example.png",
        caption: "Campaign performance analytics"
      }
    ]
  }
]; 