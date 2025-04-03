'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Download, Share2, FileImage, File, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Design {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  designRequest: {
    title: string;
    projectType: string;
    fileFormat: string;
    dimensions: string;
    createdAt: string;
  };
}

export default function MyDesignsPage() {
  const [designs, setDesigns] = React.useState<Design[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = React.useState<Design | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch('/api/designs');
        if (!response.ok) {
          throw new Error('Failed to fetch designs');
        }
        const data = await response.json();
        setDesigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load designs');
        toast.error('Failed to load designs');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.designRequest.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || design.designRequest.projectType.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleShare = async (design: Design) => {
    try {
      // Create a shareable link (you can implement this based on your needs)
      const shareUrl = `${window.location.origin}/designs/${design.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy share link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Designs"
        description="View and manage your completed designs"
      />

      <Card>
        <CardHeader>
          <CardTitle>All Designs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search designs..."
                className="w-full pl-9 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="logo">Logo Design</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {design.designRequest.fileFormat.toLowerCase().includes('image') ? (
                      <FileImage className="h-12 w-12 text-muted-foreground" />
                    ) : (
                      <File className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{design.designRequest.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{design.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span>{design.designRequest.projectType}</span>
                    <span>•</span>
                    <span>{design.designRequest.fileFormat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedDesign(design);
                          setPreviewDialogOpen(true);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleShare(design)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedDesign?.designRequest.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {selectedDesign?.designRequest.fileFormat.toLowerCase().includes('image') ? (
                <img
                  src={selectedDesign?.description} // Assuming description contains the file URL
                  alt={selectedDesign?.designRequest.title}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Project Type:</span>
                <span className="ml-2">{selectedDesign?.designRequest.projectType}</span>
              </div>
              <div>
                <span className="font-medium">File Format:</span>
                <span className="ml-2">{selectedDesign?.designRequest.fileFormat}</span>
              </div>
              <div>
                <span className="font-medium">Dimensions:</span>
                <span className="ml-2">{selectedDesign?.designRequest.dimensions}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{selectedDesign ? new Date(selectedDesign.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 