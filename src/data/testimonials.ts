export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  metrics: {
    title: string;
    value: string;
    description: string;
  }[];
  icon: string;
  results: {
    title: string;
    value: string;
    timeframe: string;
  };
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "cincoro-tequila",
    clientName: "Cincoro Tequila",
    role: "Spirits brand",
    company: "Cincoro Tequila",
    quote: "We went from struggling to find designers to launching a new collection every month. The unlimited requests feature is a game-changer.",
    rating: 5,
    metrics: [
      {
        title: "Revenue Growth",
        value: "250%",
        description: "Increase in monthly revenue"
      },
      {
        title: "Delivery Time",
        value: "24h",
        description: "Average design delivery time"
      }
    ],
    icon: "BarChart3",
    results: {
      title: "3x Revenue Growth",
      value: "3x",
      timeframe: "Results in 3 months"
    }
  },
  {
    id: "techcorp",
    clientName: "TechCorp",
    role: "Marketing Agency",
    company: "TechCorp",
    quote: "Managing social media for multiple clients used to be a nightmare. Now I can get all the designs I need in 24 hours.",
    rating: 5,
    metrics: [
      {
        title: "Client Growth",
        value: "2x",
        description: "Increase in client base"
      },
      {
        title: "Design Time",
        value: "-65%",
        description: "Reduction in design delivery time"
      }
    ],
    icon: "DollarSign",
    results: {
      title: "2x Client Growth",
      value: "2x",
      timeframe: "Results in 2 months"
    }
  },
  {
    id: "maya-patel",
    clientName: "Maya Patel",
    role: "Independent Artist",
    company: "Maya Patel Art",
    quote: "As an artist, I needed a way to turn my art into merch without the hassle. This service made it possible.",
    rating: 5,
    metrics: [
      {
        title: "Merch Sales",
        value: "400%",
        description: "Increase in merchandise sales"
      },
      {
        title: "Social Growth",
        value: "50k",
        description: "New followers across platforms"
      }
    ],
    icon: "Award",
    results: {
      title: "First Collection Sold Out",
      value: "Sold Out",
      timeframe: "Results in 1 month"
    }
  }
]; 