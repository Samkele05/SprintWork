import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";

export default function MockInterviewsEnhanced() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("medium");
  const [startingInterview, setStartingInterview] = useState(false);

  const { data: interviews } = trpc.mockInterviews.list.useQuery();
  const createMutation = trpc.mockInterviews.create.useMutation();

  const handleStartInterview = async () => {
    if (!selectedType) {
      toast.error("Please select an interview type");
      return;
    }

    setStartingInterview(true);
    try {
      const result = await createMutation.mutateAsync({
        interviewType: selectedType as any,
        difficulty: selectedDifficulty as any,
      });
      toast.success("Interview started!");
      // Navigate to interview session
      if (result) {
        window.location.href = `/interview/${(result as any).id || 1}`;
      }
    } catch (error) {
      toast.error("Failed to start interview");
    } finally {
      setStartingInterview(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mock Interviews</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interview Setup */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-6">Start New Interview</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Interview Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartInterview}
                disabled={startingInterview || !selectedType}
                className="w-full"
              >
                {startingInterview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Interview
                  </>
                )}
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-2">Tips for Success:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Speak clearly and confidently</li>
                  <li>Take a moment to think before answering</li>
                  <li>Provide specific examples</li>
                  <li>Ask clarifying questions if needed</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Interview History */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Your Interview History</h2>
            <div className="space-y-4">
              {interviews && interviews.length > 0 ? (
                interviews.map((interview: any) => (
                  <Card key={interview.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold capitalize text-lg">{interview.interviewType} Interview</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(interview.status)}`}>
                        {interview.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {interview.score && (
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Performance Score</span>
                          <span className="text-sm font-bold text-blue-600">{interview.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${interview.score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {interview.feedback && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-2">Feedback:</p>
                        <p className="text-sm text-gray-700">{interview.feedback.substring(0, 200)}...</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {interview.status === "completed" && (
                        <Button variant="outline" size="sm">
                          View Detailed Feedback
                        </Button>
                      )}
                      {interview.status === "in_progress" && (
                        <Link href={`/interview/${interview.id}`}>
                          <Button size="sm">Continue Interview</Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">No interviews yet. Start your first mock interview!</p>
                  <Button onClick={handleStartInterview} disabled={!selectedType}>
                    Start Interview
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
