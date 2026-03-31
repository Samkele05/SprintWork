import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MockInterviews() {
  const { data: interviews } = trpc.mockInterviews.list.useQuery();
  const createMutation = trpc.mockInterviews.create.useMutation();

  const handleStartInterview = async (type: string) => {
    try {
      const result = await createMutation.mutateAsync({
        interviewType: type as any,
      });
      toast.success("Interview started!");
    } catch (error) {
      toast.error("Failed to start interview");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mock Interviews</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {["behavioral", "technical", "case_study", "general"].map(type => (
            <Card key={type} className="p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {type} Interview
              </h3>
              <p className="text-gray-600 mb-4">
                Practice your {type} interview skills
              </p>
              <Button
                onClick={() => handleStartInterview(type)}
                className="w-full"
              >
                Start Interview
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Interview History</h2>
          <div className="space-y-3">
            {interviews?.map((interview: any) => (
              <div key={interview.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold capitalize">
                  {interview.interviewType}
                </h3>
                <p className="text-sm text-gray-600">
                  Score: {interview.score || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {interview.status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
