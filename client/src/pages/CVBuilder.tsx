import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CVBuilder() {
  const [formData, setFormData] = useState({
    title: "",
    content: { summary: "", experience: [], education: [] },
  });

  const createResumeMutation = trpc.resumes.create.useMutation();

  const handleSave = async () => {
    try {
      await createResumeMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
      });
      toast.success("Resume saved!");
    } catch (error) {
      toast.error("Failed to save resume");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">CV/Resume Builder</h1>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label>Resume Title</Label>
              <Input
                placeholder="e.g., Senior Developer Resume"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Professional Summary</Label>
              <Textarea
                placeholder="Write a brief summary about yourself..."
                value={formData.content.summary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, summary: e.target.value },
                  })
                }
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSave}>Save Resume</Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
