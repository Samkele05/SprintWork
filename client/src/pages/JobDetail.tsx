import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function JobDetail() {
  const [match, params] = useRoute("/job/:id");
  const jobId = parseInt(params?.id || "0");
  const { data: job } = trpc.jobs.getById.useQuery({ id: jobId });
  const applicationMutation = trpc.applications.create.useMutation();

  const handleApply = async () => {
    try {
      await applicationMutation.mutateAsync({
        jobId,
      });
      toast.success("Application submitted!");
    } catch (error) {
      toast.error("Failed to apply");
    }
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{job.company}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-semibold">{job.location}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-semibold">{job.jobType}</p>
            </div>
            <div>
              <p className="text-gray-600">Salary</p>
              <p className="font-semibold">{job.salary || "Not specified"}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
          </div>

          <Button onClick={handleApply} size="lg">
            Apply Now
          </Button>
        </Card>
      </div>
    </div>
  );
}
