import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const { data: applications } = trpc.applications.list.useQuery();
  const { data: recommendations } = trpc.recommendations.getMatches.useQuery(
    {}
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Applications
            </h3>
            <p className="text-3xl font-bold">{applications?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Recommendations
            </h3>
            <p className="text-3xl font-bold">{recommendations?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Profile Strength
            </h3>
            <p className="text-3xl font-bold">75%</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/job-search">
                <Button className="w-full">Search Jobs</Button>
              </Link>
              <Link href="/cv-builder">
                <Button variant="outline" className="w-full">
                  Build CV
                </Button>
              </Link>
              <Link href="/mock-interviews">
                <Button variant="outline" className="w-full">
                  Practice Interview
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
            <div className="space-y-3">
              {applications?.slice(0, 3).map((app: any) => (
                <div key={app.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">Application #{app.id}</p>
                  <p className="text-sm text-gray-600">{app.status}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
