import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { MobileHeader } from "@/components/MobileHeader";

export default function JobSearch() {
  const [filters, setFilters] = useState({ title: "", location: "" });
  const { data: jobs, isLoading } = trpc.jobs.search.useQuery(filters);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Job Search" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Job Search</h1>

        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Job title"
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={e =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
            <Button>Search</Button>
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <p>Loading jobs...</p>
          ) : jobs?.length === 0 ? (
            <p>No jobs found</p>
          ) : (
            jobs?.map((job: any) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-2">{job.location}</p>
                  </div>
                  <Link href={`/job/${job.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
