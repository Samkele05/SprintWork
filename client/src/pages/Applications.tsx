import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export default function Applications() {
  const { data: applications } = trpc.applications.list.useQuery();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      viewed: "bg-purple-100 text-purple-800",
      shortlisted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      offer_received: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        <div className="space-y-4">
          {applications?.map((app: any) => (
            <Card key={app.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Application #{app.id}</h3>
                  <p className="text-gray-600">Job ID: {app.jobId}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
