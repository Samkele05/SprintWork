import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";

const SAMPLE_QUESTIONS = {
  behavioral: [
    "Tell me about a time you had to overcome a challenge at work.",
    "Describe a situation where you had to work with a difficult team member.",
    "How do you handle tight deadlines?",
    "Tell me about your greatest professional achievement.",
  ],
  technical: [
    "Explain the difference between SQL and NoSQL databases.",
    "What is the time complexity of binary search?",
    "How would you optimize a slow database query?",
    "Describe the MVC architecture pattern.",
  ],
  general: [
    "Tell me about yourself and your background.",
    "What are your career goals?",
    "Why are you interested in this position?",
    "What are your key strengths?",
  ],
};

export default function InterviewSession() {
  const { user } = useAuth();
  const [interviewType, setInterviewType] = useState<
    "behavioral" | "technical" | "general"
  >("behavioral");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<
    Array<{ question: string; answer: string; feedback?: string }>
  >([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const createInterviewMutation = trpc.mockInterviews.create.useMutation();
  const submitAnswerMutation = trpc.mockInterviews.submitAnswer.useMutation();
  const completeInterviewMutation =
    trpc.mockInterviews.completeInterview.useMutation();

  const startInterview = async () => {
    try {
      const interview = await createInterviewMutation.mutateAsync({
        interviewType,
      });
      setInterviewId((interview as any)?.insertId || 1);
      setCurrentQuestion(SAMPLE_QUESTIONS[interviewType][0]);
      setSessionStarted(true);
      toast.success("Interview started! Answer the question.");
    } catch (error) {
      toast.error("Failed to start interview");
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() || !interviewId) {
      toast.error("Please provide an answer");
      return;
    }

    try {
      const result = await submitAnswerMutation.mutateAsync({
        interviewId,
        question: currentQuestion,
        answer: currentAnswer,
      });

      const newAnswer = {
        question: currentQuestion,
        answer: currentAnswer,
        feedback: result.feedback,
      };
      setAnswers([...answers, newAnswer]);

      if (questionIndex < 3) {
        setCurrentQuestion(SAMPLE_QUESTIONS[interviewType][questionIndex + 1]);
        setCurrentAnswer("");
        setQuestionIndex(questionIndex + 1);
        toast.success(`Feedback: ${result.feedback}`);
      } else {
        finishInterview();
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    }
  };

  const finishInterview = async () => {
    if (!interviewId) return;
    try {
      await completeInterviewMutation.mutateAsync({
        interviewId,
        transcript: answers,
      });
      toast.success("Interview completed and saved!");
      setSessionStarted(false);
      setAnswers([]);
      setQuestionIndex(0);
      setInterviewId(null);
    } catch (error) {
      toast.error("Failed to complete interview");
    }
  };

  const toggleCamera = async () => {
    if (!cameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOn(true);
        toast.success("Camera enabled");
      } catch (error) {
        toast.error("Could not access camera");
      }
    } else {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      setCameraOn(false);
    }
  };

  const toggleMicrophone = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success("Recording started");
    } else {
      toast.success("Recording stopped");
    }
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Mock Interview</h1>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Start a Practice Interview
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(["behavioral", "technical", "general"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setInterviewType(type)}
                    className={`p-4 border-2 rounded-lg font-medium transition ${
                      interviewType === type
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Interview
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {interviewType === "behavioral" &&
                  "Practice answering questions about your past experiences and how you handle situations."}
                {interviewType === "technical" &&
                  "Solve technical problems and explain your approach to coding challenges."}
                {interviewType === "general" &&
                  "Answer general questions about your background, goals, and interests."}
              </p>
            </div>

            <Button
              onClick={startInterview}
              size="lg"
              className="w-full"
              disabled={createInterviewMutation.isPending}
            >
              {createInterviewMutation.isPending
                ? "Starting..."
                : "Start Interview"}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Interview Session</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Question</p>
            <p className="text-2xl font-bold">{questionIndex + 1}/4</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Answers Submitted</p>
            <p className="text-2xl font-bold">{answers.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Interview Type</p>
            <p className="text-lg font-bold capitalize">{interviewType}</p>
          </Card>
        </div>

        <Card className="p-4 mb-8">
          <div className="flex gap-4 items-center">
            <Button
              variant={cameraOn ? "default" : "outline"}
              size="sm"
              onClick={toggleCamera}
              className="flex items-center gap-2"
            >
              {cameraOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
              {cameraOn ? "Camera On" : "Camera Off"}
            </Button>
            <Button
              variant={isRecording ? "default" : "outline"}
              size="sm"
              onClick={toggleMicrophone}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              {isRecording ? "Recording" : "Microphone"}
            </Button>
          </div>
          {cameraOn && (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full mt-4 rounded-lg bg-black"
            />
          )}
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Question {questionIndex + 1}
          </h2>
          <p className="text-lg text-gray-800 mb-6">{currentQuestion}</p>

          <label className="block text-sm font-medium mb-2">Your Answer</label>
          <Textarea
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            className="mb-4 min-h-[150px]"
          />

          <Button
            onClick={submitAnswer}
            disabled={submitAnswerMutation.isPending || !currentAnswer.trim()}
            className="w-full"
          >
            {submitAnswerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              `Submit Answer (${questionIndex + 1}/4)`
            )}
          </Button>
        </Card>

        {answers.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Previous Answers</h2>
            <div className="space-y-4">
              {answers.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="mb-2">
                    <p className="font-medium">
                      Q{idx + 1}: {item.question.substring(0, 50)}...
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{item.answer}</p>
                  {item.feedback && (
                    <p className="text-sm text-gray-600 italic">
                      {item.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
