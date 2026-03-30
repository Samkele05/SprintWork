import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PostJob() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    jobType: "full_time" as const,
    location: "",
  });

  const createJobMutation = trpc.recruiterJobs.create.useMutation();

  const handleSubmit = async () => {
    try {
      await createJobMutation.mutateAsync(formData);
      toast.success("Job posted successfully!");
      navigate("/recruiter/jobs");
    } catch (error) {
      toast.error("Failed to post job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Post a Job</h1>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label>Job Title</Label>
              <Input
                placeholder="e.g., Senior Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Job description..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Requirements</Label>
              <Textarea
                placeholder="Job requirements..."
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary</Label>
                <Input
                  placeholder="e.g., $100,000 - $150,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSubmit}>Post Job</Button>
              <Button variant="outline" onClick={() => navigate("/recruiter/jobs")}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
