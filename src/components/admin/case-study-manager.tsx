"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CaseStudy } from "@/data/case-studies";

export function CaseStudyManager() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [formData, setFormData] = useState<Partial<CaseStudy>>({
    title: "",
    description: "",
    category: "",
    image: "",
    results: {
      title: "",
      value: "",
      timeframe: ""
    },
    metrics: []
  });

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const response = await fetch("/api/case-studies");
      if (!response.ok) throw new Error("Failed to fetch case studies");
      const data = await response.json();
      setCaseStudies(data);
    } catch (error) {
      toast.error("Failed to fetch case studies");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCaseStudy
        ? `/api/case-studies?id=${editingCaseStudy.id}`
        : "/api/case-studies";
      const method = editingCaseStudy ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save case study");

      toast.success(
        editingCaseStudy ? "Case study updated" : "Case study created"
      );
      setIsDialogOpen(false);
      fetchCaseStudies();
    } catch (error) {
      toast.error("Failed to save case study");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;

    try {
      const response = await fetch(`/api/case-studies?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete case study");

      toast.success("Case study deleted");
      fetchCaseStudies();
    } catch (error) {
      toast.error("Failed to delete case study");
    }
  };

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setFormData(caseStudy);
    setIsDialogOpen(true);
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...(formData.metrics || []), { title: "", value: "", description: "" }]
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
        <h2 className="text-2xl font-bold">Case Studies</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Case Study
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCaseStudy ? "Edit Case Study" : "Add Case Study"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Results</label>
                <div className="space-y-2">
                  <Input
                    placeholder="Title"
                    value={formData.results?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        results: {
                          title: e.target.value,
                          value: formData.results?.value || "",
                          timeframe: formData.results?.timeframe || ""
                        }
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Value"
                    value={formData.results?.value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        results: {
                          title: formData.results?.title || "",
                          value: e.target.value,
                          timeframe: formData.results?.timeframe || ""
                        }
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Timeframe"
                    value={formData.results?.timeframe || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        results: {
                          title: formData.results?.title || "",
                          value: formData.results?.value || "",
                          timeframe: e.target.value
                        }
                      })
                    }
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
                        onChange={(e) => updateMetric(index, "title", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Value"
                        value={metric.value}
                        onChange={(e) => updateMetric(index, "value", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Description"
                        value={metric.description}
                        onChange={(e) => updateMetric(index, "description", e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingCaseStudy ? "Update Case Study" : "Create Case Study"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((caseStudy) => (
          <div
            key={caseStudy.id}
            className="p-4 border rounded-lg space-y-4"
          >
            <img
              src={caseStudy.image}
              alt={caseStudy.title}
              className="w-full h-48 object-cover rounded-md"
            />
            <div>
              <h3 className="font-semibold">{caseStudy.title}</h3>
              <p className="text-sm text-muted-foreground">
                {caseStudy.category}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(caseStudy)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(caseStudy.id)}
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