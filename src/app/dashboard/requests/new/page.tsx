'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/file-upload';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { DesignTemplates } from '@/components/design-templates';

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

interface FormData {
  title: string;
  description: string;
  priority: string;
  projectType: string;
  fileFormat: string;
  dimensions: string;
  customUnit: string;
  customWidth?: string;
  customHeight?: string;
  files: any[];
}

const PROJECT_TYPES = [
  { value: 'logo', label: 'Logo Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'ads', label: 'Advertisement' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'print', label: 'Print Materials' },
  { value: 'web-graphics', label: 'Website Graphics' },
  { value: 'app-ui', label: 'App Design UI' },
  { value: 'cover-art', label: 'Cover Art' },
  { value: 'apparel', label: 'Apparel Design' },
  { value: 'other', label: 'Other' },
];

const FILE_FORMATS = [
  { value: 'psd', label: 'Photoshop (PSD)' },
  { value: 'ai', label: 'Illustrator (AI)' },
  { value: 'pdf', label: 'PDF' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'svg', label: 'SVG' },
  { value: 'eps', label: 'EPS' },
];

const COMMON_SIZES = [
  { value: 'social-square', label: 'Social Media Square (1080x1080px)' },
  { value: 'social-portrait', label: 'Social Media Portrait (1080x1350px)' },
  { value: 'social-landscape', label: 'Social Media Landscape (1200x628px)' },
  { value: 'logo-standard', label: 'Logo Standard (500x500px)' },
  { value: 'banner-wide', label: 'Banner Wide (1920x1080px)' },
  { value: 'print-a4', label: 'Print A4 (8.27" x 11.69")' },
  { value: 'print-letter', label: 'Print Letter (8.5" x 11")' },
  { value: 'custom', label: 'Custom Size' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectType: '',
    fileFormat: '',
    dimensions: '',
    customUnit: 'px',
    files: [],
  });

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch('/api/subscription/check');
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to check subscription status');
          }

          if (!data.hasActiveSubscription) {
            toast.error("An active subscription is required to create design requests");
            router.push("/dashboard/billing");
            return;
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
          toast.error("Failed to verify subscription status");
          router.push("/dashboard/billing");
        }
      }
    };

    checkSubscription();
  }, [status, session, router]);

  const handleTemplateSelect = (template: DesignTemplate) => {
    setFormData({
      title: template.name,
      description: template.defaultDescription,
      priority: "MEDIUM",
      projectType: template.projectType,
      fileFormat: template.fileFormat,
      dimensions: template.dimensions,
      customUnit: "px",
      files: []
    });
    // Scroll to the form
    document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.projectType) {
      errors.projectType = 'Project type is required';
    }
    
    if (!formData.fileFormat) {
      errors.fileFormat = 'File format is required';
    }
    
    if (!formData.dimensions) {
      errors.dimensions = 'Dimensions are required';
    }
    
    if (formData.dimensions === 'custom') {
      if (!formData.customWidth) {
        errors.customWidth = 'Width is required for custom dimensions';
      }
      if (!formData.customHeight) {
        errors.customHeight = 'Height is required for custom dimensions';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let submissionError = false; // Flag to track if an error occurred
    
    // 1. Validate the form first
    if (!validateForm()) {
      // If validation fails, scroll to the first error and stop
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
        toast.error("Please fill in all required fields.")
      }
      return; // Stop submission if validation fails
    }

    // 2. If validation passes, THEN set submitting state and clear errors
    setSubmitting(true);
    setError(null);

    try {
      // Log the form data before sending
      console.log("Submitting form data:", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        projectType: formData.projectType,
        fileFormat: formData.fileFormat,
        dimensions: formData.dimensions === 'custom' 
                    ? `${formData.customWidth}x${formData.customHeight}${formData.customUnit}` 
                    : formData.dimensions,
        // files: formData.files // If files need to be submitted here, adjust API
      });

      const response = await fetch("/api/design-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          projectType: formData.projectType,
          fileFormat: formData.fileFormat,
          dimensions: formData.dimensions === 'custom' 
                      ? `${formData.customWidth}x${formData.customHeight}${formData.customUnit}` 
                      : formData.dimensions,
          // Include file URLs if your API expects them
          // files: formData.files.map(file => file.url) 
        }),
      });

      // Check if response is truly ok before parsing JSON
      if (!response.ok) {
        let errorData = { error: "Server responded unexpectedly", details: `Status: ${response.status}` };
        try {
          // Try to parse error details from JSON body
          errorData = await response.json();
        } catch (parseError) {
          console.error("Could not parse error response JSON:", parseError);
        }
        throw new Error(errorData.error || errorData.details || "Failed to create design request");
      }

      // Attempt to parse JSON only if response.ok
      const data = await response.json();
      console.log("Server response:", data); 
      
      // Success Path:
      toast.success("Design request submitted successfully!");
      router.push("/dashboard/requests"); // Navigate immediately
      // *** Crucially, DO NOT set submitting = false here ***

    } catch (error) {
      submissionError = true; // Mark that an error occurred
      console.error("Error creating design request:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission";
      setError(errorMessage);
      toast.error(errorMessage)
      // Don't reset the form on error
    } finally {
      // 3. Only set submitting back to false IF an error occurred
      if (submissionError) {
        setSubmitting(false);
      }
      // Otherwise, submitting remains true while navigating away
    }
  };

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="New Design Request" 
        description="Choose a template or fill out the form to submit a new design request."
      />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>
              Choose a template to quickly fill in common design request details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignTemplates onSelectTemplate={handleTemplateSelect} />
          </CardContent>
        </Card>

        <Card id="request-form">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Provide details about your design request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Enter request title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-500">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                  >
                    <SelectTrigger className={formErrors.projectType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.projectType && (
                    <p className="text-sm text-red-500">{formErrors.projectType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileFormat">File Format <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.fileFormat}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fileFormat: value }))}
                  >
                    <SelectTrigger className={formErrors.fileFormat ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select file format" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.fileFormat && (
                    <p className="text-sm text-red-500">{formErrors.fileFormat}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.dimensions}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dimensions: value }))}
                  >
                    <SelectTrigger className={formErrors.dimensions ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select dimensions" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.dimensions && (
                    <p className="text-sm text-red-500">{formErrors.dimensions}</p>
                  )}
                </div>

                {formData.dimensions === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="customWidth">Width <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="customWidth"
                          type="number"
                          placeholder="Enter width"
                          value={formData.customWidth}
                          onChange={(e) => setFormData(prev => ({ ...prev, customWidth: e.target.value }))}
                          className={formErrors.customWidth ? "border-red-500" : ""}
                        />
                        <Select
                          value={formData.customUnit}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, customUnit: value }))}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formErrors.customWidth && (
                        <p className="text-sm text-red-500">{formErrors.customWidth}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customHeight">Height <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="customHeight"
                          type="number"
                          placeholder="Enter height"
                          value={formData.customHeight}
                          onChange={(e) => setFormData(prev => ({ ...prev, customHeight: e.target.value }))}
                          className={formErrors.customHeight ? "border-red-500" : ""}
                        />
                        <Select
                          value={formData.customUnit}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, customUnit: value }))}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formErrors.customHeight && (
                        <p className="text-sm text-red-500">{formErrors.customHeight}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe your design request in detail"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reference Files</Label>
                <FileUpload
                  endpoint="designRequestUploader"
                  value={formData.files}
                  onChange={(files) => setFormData(prev => ({ ...prev, files }))}
                />
                <p className="text-xs text-muted-foreground">
                  Attach any relevant images or documents (max 5 files).
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/requests')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 