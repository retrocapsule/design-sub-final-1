'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Palette, 
  Image, 
  FileText, 
  Mail, 
  Globe, 
  CreditCard, 
  BookOpen, 
  Gift,
  Music,
  Box
} from "lucide-react";

interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectType: string;
  fileFormat: string;
  dimensions: string;
  defaultDescription: string;
}

interface DesignTemplatesProps {
  onSelectTemplate: (template: DesignTemplate) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  Palette,
  Image,
  FileText,
  Mail,
  Globe,
  CreditCard,
  BookOpen,
  Gift,
  Music,
  Box
};

export function DesignTemplates({ onSelectTemplate }: DesignTemplatesProps) {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/design-templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError('Failed to load templates');
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {templates.map((template) => {
        const Icon = iconMap[template.icon];
        return (
          <Card
            key={template.id}
            className="cursor-pointer hover:bg-slate-50 transition-colors group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 