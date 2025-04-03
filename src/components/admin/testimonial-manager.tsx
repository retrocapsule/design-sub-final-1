'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';
import { Testimonial } from '@/data/testimonials';

export function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    clientName: '',
    role: '',
    company: '',
    quote: '',
    rating: 5,
    metrics: [{ title: '', value: '', description: '' }],
    icon: '',
    results: { title: '', value: '', timeframe: '' }
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      alert('Failed to load testimonials. Please try again.');
    }
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setFormData({
      clientName: '',
      role: '',
      company: '',
      quote: '',
      rating: 5,
      metrics: [{ title: '', value: '', description: '' }],
      icon: '',
      results: { title: '', value: '', timeframe: '' }
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const response = await fetch(`/api/testimonials?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete testimonial');
        
        setTestimonials(testimonials.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('Failed to delete testimonial. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        const response = await fetch('/api/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTestimonial.id,
            ...formData
          }),
        });

        if (!response.ok) throw new Error('Failed to update testimonial');
        
        const updated = await response.json();
        setTestimonials(testimonials.map(t => 
          t.id === editingTestimonial.id ? updated : t
        ));
      } else {
        const response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create testimonial');
        
        const created = await response.json();
        setTestimonials([...testimonials, created]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial. Please try again.');
    }
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...(formData.metrics || []), { title: '', value: '', description: '' }]
    });
  };

  const updateMetric = (index: number, field: string, value: string) => {
    const newMetrics = [...(formData.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setFormData({ ...formData, metrics: newMetrics });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Quote</label>
              <Input
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Icon</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Results</label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Title"
                  value={formData.results?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    results: { 
                      title: e.target.value,
                      value: formData.results?.value || '',
                      timeframe: formData.results?.timeframe || ''
                    }
                  })}
                  required
                />
                <Input
                  placeholder="Value"
                  value={formData.results?.value || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    results: { 
                      title: formData.results?.title || '',
                      value: e.target.value,
                      timeframe: formData.results?.timeframe || ''
                    }
                  })}
                  required
                />
                <Input
                  placeholder="Timeframe"
                  value={formData.results?.timeframe || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    results: { 
                      title: formData.results?.title || '',
                      value: formData.results?.value || '',
                      timeframe: e.target.value
                    }
                  })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium">Metrics</label>
                <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                  Add Metric
                </Button>
              </div>
              <div className="space-y-4">
                {formData.metrics?.map((metric, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Title"
                      value={metric.title}
                      onChange={(e) => updateMetric(index, 'title', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Value"
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Description"
                      value={metric.description}
                      onChange={(e) => updateMetric(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="p-4 border rounded-lg space-y-4"
          >
            <div>
              <h3 className="font-semibold">{testimonial.clientName}</h3>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
            <div className="flex items-center text-yellow-400">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{testimonial.quote}</p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(testimonial)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(testimonial.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 