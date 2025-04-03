import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Example } from "@/data/examples";

interface ExampleViewerProps {
  isOpen: boolean;
  onClose: () => void;
  example: Example;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ExampleViewer({
  isOpen,
  onClose,
  example,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ExampleViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="text-base sm:text-lg md:text-xl">{example.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 pb-3 sm:pb-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={example.image}
              alt={example.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm text-white">
                {example.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:p-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Process</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                {example.details.process.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Tools Used</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {example.details.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-primary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Timeline</h3>
              <p className="text-sm sm:text-base">{example.details.timeline}</p>
            </div>

            <div>
              <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Results</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                {example.details.results.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3 sm:pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10"
          >
            Next
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 