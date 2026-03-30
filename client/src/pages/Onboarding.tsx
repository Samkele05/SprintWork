import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"job_seeker" | "recruiter">("job_seeker");
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    headline: "",
    currentRole: "",
    yearsExperience: 0,
    companyName: "",
    jobTitle: "",
  });

  const jobSeekerMutation = trpc.jobSeekerProfile.update.useMutation();
  const recruiterMutation = trpc.recruiterProfile.update.useMutation();
  const switchUserTypeMutation = trpc.profile.switchUserType.useMutation();

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      try {
        // Switch user type first
        await switchUserTypeMutation.mutateAsync(userType);

        // Then save profile details
        if (userType === "job_seeker") {
          await jobSeekerMutation.mutateAsync({
            headline: formData.headline,
            currentRole: formData.currentRole,
            yearsExperience: formData.yearsExperience,
          });
        } else {
          await recruiterMutation.mutateAsync({
            companyName: formData.companyName,
            jobTitle: formData.jobTitle,
          });
        }
        toast.success("Profile setup complete!");

        // Redirect to appropriate dashboard
        navigate("/dashboard");
      } catch (error) {
        toast.error("Failed to save profile");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to SprintWork</h1>
        <p className="text-gray-600 mb-8">Your AI-powered career companion</p>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">What's your role?</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserType("job_seeker")}
                  className={`p-6 border-2 rounded-lg transition ${
                    userType === "job_seeker"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <h3 className="font-semibold">Job Seeker</h3>
                  <p className="text-sm text-gray-600">Find your next opportunity</p>
                </button>
                <button
                  onClick={() => setUserType("recruiter")}
                  className={`p-6 border-2 rounded-lg transition ${
                    userType === "recruiter"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">👔</div>
                  <h3 className="font-semibold">Recruiter</h3>
                  <p className="text-sm text-gray-600">Hire top talent</p>
                </button>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {userType === "job_seeker" ? "Tell us about yourself" : "Tell us about your company"}
            </h2>

            {userType === "job_seeker" ? (
              <>
                <div>
                  <Label>Professional Headline</Label>
                  <Input
                    placeholder="e.g., Full Stack Developer"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Current Role</Label>
                  <Input
                    placeholder="e.g., Senior Developer"
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.yearsExperience}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Your Job Title</Label>
                  <Input
                    placeholder="e.g., Hiring Manager"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" disabled={switchUserTypeMutation.isPending || jobSeekerMutation.isPending || recruiterMutation.isPending}>
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
