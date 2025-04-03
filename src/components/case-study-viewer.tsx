"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CaseStudy } from "@/data/case-studies";

interface CaseStudyViewerProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudy: CaseStudy;
}

export function CaseStudyViewer({
  isOpen,
  onClose,
  caseStudy,
}: CaseStudyViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="text-base sm:text-lg md:text-xl">{caseStudy.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 pb-3 sm:pb-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={caseStudy.image}
              alt={caseStudy.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm text-white">
                {caseStudy.category}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
            {caseStudy.metrics.map((metric, index) => (
              <div key={index} className="rounded-lg border bg-card p-3 sm:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{metric.value}</div>
                <div className="text-sm sm:text-base font-semibold">{metric.title}</div>
                <p className="text-xs sm:text-sm text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-lg border bg-muted/50 p-4 sm:p-6">
            <blockquote className="mb-3 sm:mb-4 text-base sm:text-lg italic">"{caseStudy.testimonial.quote}"</blockquote>
            <div>
              <div className="text-sm sm:text-base font-semibold">{caseStudy.testimonial.author}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{caseStudy.testimonial.role}</div>
            </div>
          </div>

          {/* Process */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Our Process</h3>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {caseStudy.process.map((step, index) => (
                <div key={index} className="rounded-lg border bg-card p-3 sm:p-4">
                  <div className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold">{step.title}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Project Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {caseStudy.gallery.map((item, index) => (
                <div key={index} className="group relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.caption}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs sm:text-sm">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 