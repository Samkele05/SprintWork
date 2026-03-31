import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function SavedSearches() {
  const { data: searches } = trpc.savedSearches.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Saved Searches</h1>

        <div className="space-y-4">
          {searches?.map((search: any) => (
            <Card key={search.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{search.name}</h3>
                  <p className="text-gray-600">
                    Alert: {search.alertFrequency}
                  </p>
                </div>
                <Button variant="outline">View Results</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
