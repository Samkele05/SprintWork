import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function RecruiterDashboard() {
  const { data: postedJobs } = trpc.recruiterJobs.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recruiter Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Posted Jobs</h3>
            <p className="text-3xl font-bold">{postedJobs?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Applications</h3>
            <p className="text-3xl font-bold">24</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Shortlisted</h3>
            <p className="text-3xl font-bold">8</p>
          </Card>
        </div>

        <Link href="/recruiter/post-job">
          <Button className="mb-6">Post New Job</Button>
        </Link>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Posted Jobs</h2>
          <div className="space-y-3">
            {postedJobs?.map((job: any) => (
              <div key={job.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.applicantCount} applications</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
