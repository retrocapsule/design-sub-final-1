import { Testimonial } from '@/data/testimonials';

// In a real application, this would be replaced with actual database operations
class TestimonialService {
  private testimonials: Testimonial[] = [];

  async getAllTestimonials(): Promise<Testimonial[]> {
    return this.testimonials;
  }

  async getTestimonialById(id: string): Promise<Testimonial | null> {
    return this.testimonials.find(t => t.id === id) || null;
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Date.now().toString()
    };
    this.testimonials.push(newTestimonial);
    return newTestimonial;
  }

  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial | null> {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.testimonials[index] = {
      ...this.testimonials[index],
      ...testimonial
    };
    return this.testimonials[index];
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const initialLength = this.testimonials.length;
    this.testimonials = this.testimonials.filter(t => t.id !== id);
    return this.testimonials.length < initialLength;
  }
}

export const testimonialService = new TestimonialService(); 