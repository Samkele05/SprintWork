import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CVBuilderEnhanced() {
  const [step, setStep] = useState<"create" | "tailor">("create");
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [tailoringInProgress, setTailoringInProgress] = useState(false);

  const { data: resumes } = trpc.resumes.list.useQuery();
  const { data: jobs } = trpc.jobs.search.useQuery({ limit: 100 });
  const { data: tailoredResume } = trpc.cvTailoring.getTailored.useQuery(
    { jobId: selectedJobId || 0 },
    { enabled: !!selectedJobId }
  );

  const createResumeMutation = trpc.resumes.create.useMutation();
  const tailorMutation = trpc.cvTailoring.tailorForJob.useMutation();

  const handleTailorResume = async () => {
    if (!selectedResumeId || !selectedJobId) {
      toast.error("Please select both a resume and a job");
      return;
    }

    setTailoringInProgress(true);
    try {
      const result = await tailorMutation.mutateAsync({
        resumeId: selectedResumeId,
        jobId: selectedJobId,
      });
      toast.success(`Resume tailored! Match score: ${result.matchScore}%`);
    } catch (error) {
      toast.error("Failed to tailor resume");
    } finally {
      setTailoringInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">CV/Resume Builder</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={step === "create" ? "default" : "outline"}
            onClick={() => setStep("create")}
          >
            Create Resume
          </Button>
          <Button
            variant={step === "tailor" ? "default" : "outline"}
            onClick={() => setStep("tailor")}
          >
            Tailor for Job
          </Button>
        </div>

        {step === "create" ? (
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Create New Resume</h2>
            <div className="space-y-6">
              <div>
                <Label>Resume Title</Label>
                <Input placeholder="e.g., Senior Developer Resume 2026" />
              </div>

              <div>
                <Label>Professional Summary</Label>
                <Textarea
                  placeholder="Write a compelling summary of your professional background..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Position</Label>
                  <Input placeholder="e.g., Senior Software Engineer" />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input type="number" placeholder="5" />
                </div>
              </div>

              <div>
                <Label>Key Skills (comma-separated)</Label>
                <Input placeholder="React, Node.js, TypeScript, Python, AWS" />
              </div>

              <div>
                <Label>Education</Label>
                <Textarea placeholder="List your educational background..." rows={3} />
              </div>

              <div>
                <Label>Work Experience</Label>
                <Textarea placeholder="Describe your professional experience..." rows={4} />
              </div>

              <Button className="w-full">Save Resume</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6">Tailor Resume for Job</h2>
            <div className="space-y-6">
              <div>
                <Label>Select Resume</Label>
                <Select value={selectedResumeId?.toString() || ""} onValueChange={(v) => setSelectedResumeId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resume..." />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes?.map((resume: any) => (
                      <SelectItem key={resume.id} value={resume.id.toString()}>
                        {resume.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Job to Tailor For</Label>
                <Select value={selectedJobId?.toString() || ""} onValueChange={(v) => setSelectedJobId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job: any) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} at {job.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tailoredResume && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Tailored Resume Preview</h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(tailoredResume, null, 2)}</pre>
                  </div>
                </div>
              )}

              <Button
                onClick={handleTailorResume}
                disabled={tailoringInProgress || !selectedResumeId || !selectedJobId}
                className="w-full"
              >
                {tailoringInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tailoring Resume...
                  </>
                ) : (
                  "Tailor Resume with AI"
                )}
              </Button>

              <Button variant="outline" className="w-full">
                Download Tailored Resume
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
