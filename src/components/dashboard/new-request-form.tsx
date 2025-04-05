'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { UploadButton } from "@uploadthing/react";
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitNewRequest } from '@/actions/design-requests';
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const uploadedFileSchema = z.object({
    key: z.string(),
    name: z.string(),
    url: z.string().url(),
    size: z.number(),
});

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  referenceLinks: z.string().optional(),
  uploadedFiles: z.array(uploadedFileSchema).optional(),
});

type UploadedFileState = z.infer<typeof uploadedFileSchema>;

export function NewRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileState[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      referenceLinks: "",
      uploadedFiles: [],
    },
  });

  const handleRemoveFile = (key: string) => {
      setUploadedFiles((prev) => prev.filter(file => file.key !== key));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const dataToSubmit = { ...values, uploadedFiles };
        
        const result = await submitNewRequest(dataToSubmit);

        if (result.success) {
            toast.success(result.message || "Design request submitted successfully!");
            form.reset();
            setUploadedFiles([]);
            router.push('/dashboard/requests');
        } else {
            toast.error(result.message || "Failed to submit design request");
        }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Logo Design, Business Card, Website Banner" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear title describing what you need.
                  </FormDescription>
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
                      placeholder="Describe your design needs in detail..." 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include details like colors, style, dimensions, and purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="referenceLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Links (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="https://example.com/inspiration1\nhttps://example.com/inspiration2" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add links to designs you like (one per line).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
                <FormLabel>Reference Files</FormLabel>
                <FormControl>
                    {uploadedFiles.length > 0 && (
                        <div className="mb-4 space-y-2">
                            <p className="text-sm font-medium">Uploaded Files:</p>
                            <ul className="list-disc list-inside bg-muted p-3 rounded-md">
                                {uploadedFiles.map((file) => (
                                    <li key={file.key} className="text-sm flex justify-between items-center">
                                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                        <Button 
                                            type="button" 
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFile(file.key)}
                                            aria-label={`Remove ${file.name}`}
                                            className="ml-2 h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <UploadButton<OurFileRouter>
                        endpoint="designRequestUploader"
                        onClientUploadComplete={(res) => {
                            if (res) {
                                console.log("Upload completed:", res);
                                const newFiles: UploadedFileState[] = res.map(file => ({
                                    key: file.key,
                                    name: file.name,
                                    url: file.url,
                                    size: file.size
                                }));
                                setUploadedFiles((prev) => [...prev, ...newFiles]);
                                toast.success(`${res.length} file(s) uploaded successfully!`);
                            }
                        }}
                        onUploadError={(error: Error) => {
                            console.error("Upload failed:", error.message, error);
                            toast.error(`Upload Failed: ${error.message || "Check the console for details"}`);
                        }}
                        onUploadBegin={() => {
                            console.log("Upload starting...");
                        }}
                        config={{
                            mode: "manual",
                            appendOnPreflight: true,
                            uploadUrl: "https://eu.ingest.uploadthing.com"
                        }}
                        appearance={{
                            button: "bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-md font-medium",
                            container: "w-full border-2 border-dashed border-slate-300 rounded-md p-4 bg-slate-50",
                            allowedContent: "text-slate-700 font-medium text-sm mt-2"
                        }}
                    />
                </FormControl>
                <FormDescription>
                    Upload reference images or PDFs (Max 5 files).
                </FormDescription>
                <FormMessage />
            </FormItem>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 