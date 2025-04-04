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
    title: "Basic Package",
    description: "Ideal for individuals and small teams needing essential design support.",
    price: "$299/month",
    features: [
      "1 Active Request",
      "Social Media Graphics",
      "Email Templates",
      "Basic Brand Assets",
      "72-Hour Delivery Time"
    ],
    category: "Basic",
    image: "/Images/services/basic-package.jpg"
  },
  {
    id: "2",
    title: "Pro Package",
    description: "Perfect for growing businesses requiring more design capacity and faster turnaround.",
    price: "$599/month",
    features: [
      "2 Active Requests",
      "Everything in Basic",
      "Website Design",
      "Marketing Materials",
      "Brand Guidelines",
      "48-Hour Delivery Time"
    ],
    category: "Professional",
    image: "/Images/services/pro-package.jpg"
  },
  {
    id: "3",
    title: "Enterprise Package",
    description: "Comprehensive design partnership for large organizations with complex needs.",
    price: "$999/month",
    features: [
      "3 Active Requests",
      "Everything in Professional",
      "Custom Illustrations",
      "3D Design",
      "Video Graphics",
      "Priority Support",
      "24-Hour Priority Delivery"
    ],
    category: "Enterprise",
    image: "/Images/services/enterprise-package.jpg"
  }
]; 