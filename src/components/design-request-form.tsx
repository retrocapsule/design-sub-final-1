'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/file-upload';
import { DesignTemplates } from "@/components/design-templates";

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  files: z.array(z.string()).optional(),
});

export function DesignRequestForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectType: '',
    fileFormat: '',
    dimensions: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user.subscriptionStatus !== 'active') {
      toast.error('An active subscription is required to submit design requests');
      router.push('/dashboard/billing');
    }
  }, [status, session, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      files: [],
    },
  });

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      projectType: template.projectType,
      fileFormat: template.fileFormat,
      dimensions: template.dimensions,
      description: template.defaultDescription,
    }));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (status !== 'authenticated') {
      toast.error('Please sign in to submit a request');
      router.push('/signin');
      return;
    }

    if (session?.user.subscriptionStatus !== 'active') {
      toast.error('An active subscription is required to submit design requests');
      router.push('/dashboard/billing');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/design-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      toast.success('Request created successfully');
      router.push('/dashboard/requests');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'authenticated' && session?.user.subscriptionStatus !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Subscription Required</h2>
          <p className="text-muted-foreground">
            An active subscription is required to submit design requests.
          </p>
          <Button onClick={() => router.push('/dashboard/billing')}>
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Design Request</h2>
        <p className="text-muted-foreground">
          Choose a template or fill out the form manually
        </p>
      </div>

      <DesignTemplates onSelectTemplate={handleTemplateSelect} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter request title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your design request in detail..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Files (Optional)</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating request...' : 'Submit Request'}
          </Button>
        </form>
      </Form>
    </div>
  );
} 