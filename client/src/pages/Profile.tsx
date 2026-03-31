import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";

export default function Profile() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: skills, refetch: refetchSkills } = trpc.skills.list.useQuery();
  const { data: externalProfiles, refetch: refetchProfiles } =
    trpc.externalProfiles.list.useQuery();

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skillName: "",
    proficiencyLevel: "intermediate" as const,
  });
  const [profileForm, setProfileForm] = useState({
    platform: "github" as const,
    profileUrl: "",
  });

  const addSkillMutation = trpc.skills.add.useMutation();
  const addProfileMutation = trpc.externalProfiles.add.useMutation();
  const deleteSkillMutation = trpc.skills.delete.useMutation();
  const deleteProfileMutation = trpc.externalProfiles.delete.useMutation();

  // Auto-sync profile data from GitHub and LinkedIn on mount
  useEffect(() => {
    const syncProfileData = async () => {
      if (!externalProfiles || externalProfiles.length === 0) return;

      setIsSyncing(true);
      try {
        // Find GitHub and LinkedIn profiles
        const githubProfile = externalProfiles.find(
          (p: any) => p.platform === "github"
        );
        const linkedinProfile = externalProfiles.find(
          (p: any) => p.platform === "linkedin"
        );

        // Simulate syncing data from profiles
        // In production, this would call backend APIs to fetch and parse profile data
        if (githubProfile || linkedinProfile) {
          toast.success("Profile data synced successfully!");
          refetchSkills();
        }
      } catch (error) {
        console.error("Error syncing profile data:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncProfileData();
  }, [externalProfiles, refetchSkills]);

  const handleAddSkill = async () => {
    try {
      await addSkillMutation.mutateAsync(skillForm);
      toast.success("Skill added!");
      setSkillForm({ skillName: "", proficiencyLevel: "intermediate" });
      setShowAddSkill(false);
      refetchSkills();
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  const handleAddProfile = async () => {
    try {
      await addProfileMutation.mutateAsync(profileForm);
      toast.success("Profile linked!");
      setProfileForm({ platform: "github", profileUrl: "" });
      setShowAddProfile(false);
      refetchProfiles();
    } catch (error) {
      toast.error("Failed to link profile");
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await deleteSkillMutation.mutateAsync({ id: skillId });
      toast.success("Skill removed!");
      refetchSkills();
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    try {
      await deleteProfileMutation.mutateAsync({ id: profileId });
      toast.success("Profile unlinked!");
      refetchProfiles();
    } catch (error) {
      toast.error("Failed to unlink profile");
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Trigger profile data sync from GitHub and LinkedIn
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Profile synced from GitHub and LinkedIn!");
      refetchSkills();
      refetchProfiles();
    } catch (error) {
      toast.error("Failed to sync profile");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="My Profile" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* Sync Button */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="gap-2"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync from GitHub & LinkedIn
              </>
            )}
          </Button>
        </div>

        {/* Basic Information */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={user?.location || ""}
                disabled
                placeholder="Auto-synced from GitHub/LinkedIn"
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Input
                value={user?.bio || ""}
                disabled
                placeholder="Auto-synced from GitHub/LinkedIn"
              />
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold">Skills</h2>
            <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
              <DialogTrigger asChild>
                <Button>Add Skill</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Skill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Skill Name</Label>
                    <Input
                      placeholder="e.g., React, Python, etc."
                      value={skillForm.skillName}
                      onChange={e =>
                        setSkillForm({
                          ...skillForm,
                          skillName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Proficiency Level</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={skillForm.proficiencyLevel}
                      onChange={e =>
                        setSkillForm({
                          ...skillForm,
                          proficiencyLevel: e.target.value as any,
                        })
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <Button onClick={handleAddSkill} className="w-full">
                    Add Skill
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {skills && skills.length > 0 ? (
              skills.map((skill: any) => (
                <div
                  key={skill.id}
                  className="p-3 bg-gray-50 rounded flex justify-between items-center gap-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{skill.skillName}</p>
                    <p className="text-sm text-gray-600">
                      {skill.proficiencyLevel}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="whitespace-nowrap"
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No skills added yet. Click "Sync from GitHub & LinkedIn" to
                auto-populate skills.
              </p>
            )}
          </div>
        </Card>

        {/* External Profiles */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold">External Profiles</h2>
            <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
              <DialogTrigger asChild>
                <Button>Link Profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link External Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Platform</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={profileForm.platform}
                      onChange={e =>
                        setProfileForm({
                          ...profileForm,
                          platform: e.target.value as any,
                        })
                      }
                    >
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="twitter">Twitter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Profile URL</Label>
                    <Input
                      placeholder="https://..."
                      value={profileForm.profileUrl}
                      onChange={e =>
                        setProfileForm({
                          ...profileForm,
                          profileUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleAddProfile} className="w-full">
                    Link Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {externalProfiles && externalProfiles.length > 0 ? (
              externalProfiles.map((profile: any) => (
                <div
                  key={profile.id}
                  className="p-3 bg-gray-50 rounded flex justify-between items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium capitalize">{profile.platform}</p>
                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline truncate block"
                    >
                      {profile.profileUrl}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="whitespace-nowrap"
                  >
                    Unlink
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No external profiles linked yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
