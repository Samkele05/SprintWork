import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function RecruiterJobs() {
  const { data: jobs } = trpc.recruiterJobs.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Posted Jobs</h1>
          <Link href="/recruiter/post-job">
            <Button>Post New Job</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {jobs?.map((job: any) => (
            <Card key={job.id} className="p-6">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-gray-600">{job.applicantCount} applications</p>
              <p className="text-sm text-gray-500 mt-2">Status: {job.status}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
