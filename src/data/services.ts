export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  category: string;
  image: string;
}

export const services: Service[] = [
  {
    id: "1",
    title: "Basic Design Package",
    description: "Perfect for small businesses and startups",
    price: "$299/month",
    features: [
      "Social Media Graphics",
      "Email Templates",
      "Basic Brand Assets",
      "72-Hour Delivery Time"
    ],
    category: "Basic",
    image: "/images/services/basic-package.jpg"
  },
  {
    id: "2",
    title: "Professional Design Package",
    description: "Ideal for growing businesses",
    price: "$599/month",
    features: [
      "Everything in Basic",
      "Website Design",
      "Marketing Materials",
      "Brand Guidelines",
      "48-Hour Delivery Time"
    ],
    category: "Professional",
    image: "/images/services/pro-package.jpg"
  },
  {
    id: "3",
    title: "Enterprise Design Package",
    description: "For large organizations with complex needs",
    price: "$999/month",
    features: [
      "Everything in Professional",
      "Custom Illustrations",
      "3D Design",
      "Video Graphics",
      "Priority Support",
      "24-Hour Priority Delivery"
    ],
    category: "Enterprise",
    image: "/images/services/enterprise-package.jpg"
  }
]; 