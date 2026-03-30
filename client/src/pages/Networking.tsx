import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Networking() {
  const { data: connections } = trpc.connections.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Networking</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Connections</h2>
          <p className="text-gray-600 mb-4">Total: {connections?.length || 0}</p>
          <div className="space-y-3">
            {connections?.map((conn: any) => (
              <div key={conn.id} className="p-4 border rounded-lg">
                <p className="font-semibold">Connection #{conn.id}</p>
                <p className="text-sm text-gray-600">Status: {conn.status}</p>
              </div>
            ))}
          </div>
        </Card>

        <Button>Find Professionals</Button>
      </div>
    </div>
  );
}
