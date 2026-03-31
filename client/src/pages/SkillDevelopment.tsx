import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function SkillDevelopment() {
  const { data: courses } = trpc.courses.list.useQuery();
  const { data: progress } = trpc.courses.getProgress.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Skill Development</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="space-y-3">
            {progress?.map((p: any) => (
              <div key={p.id} className="p-4 border rounded-lg">
                <p className="font-semibold">Course {p.courseId}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {p.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses?.map((course: any) => (
            <Card key={course.id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <Button className="w-full">Enroll Now</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
