import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Sparkles,
  Zap,
  Brain,
  Network,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">SprintWork</div>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Your AI-Powered Career Companion
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          SprintWork uses advanced AI and machine learning to help you find the
          perfect job, prepare for interviews, and advance your career.
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/job-search">
                <Button size="lg" variant="outline">
                  Search Jobs
                </Button>
              </Link>
            </>
          ) : (
            <>
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
              </a>
              <a href={getLoginUrl()}>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </a>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI CV Tailoring */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold">AI CV Tailoring</h3>
            </div>
            <p className="text-gray-600">
              Automatically tailor your resume to match job postings. Our AI
              optimizes for ATS and highlights your most relevant skills.
            </p>
          </Card>

          {/* Mock Interviews */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
              <h3 className="text-xl font-semibold">Mock Interviews</h3>
            </div>
            <p className="text-gray-600">
              Practice with AI-powered interviews. Get real-time feedback,
              scoring, and personalized coaching to ace your interviews.
            </p>
          </Card>

          {/* Smart Job Matching */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold">Smart Job Matching</h3>
            </div>
            <p className="text-gray-600">
              Machine learning algorithms match you with jobs that fit your
              skills, experience, and career goals.
            </p>
          </Card>

          {/* Job Aggregation */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
              <h3 className="text-xl font-semibold">Job Aggregation</h3>
            </div>
            <p className="text-gray-600">
              Access jobs from LinkedIn, Indeed, Upwork, and more in one place.
              Never miss an opportunity.
            </p>
          </Card>

          {/* Networking */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold">Networking Hub</h3>
            </div>
            <p className="text-gray-600">
              Connect with recruiters, mentors, and professionals. Build
              meaningful relationships that advance your career.
            </p>
          </Card>

          {/* Skill Development */}
          <Card className="p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-semibold">Skill Development</h3>
            </div>
            <p className="text-gray-600">
              Access personalized learning paths and courses to develop
              in-demand skills and stay competitive.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Create Profile</h3>
            <p className="text-gray-600">
              Set up your profile and tell us about your career goals
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Get Matched</h3>
            <p className="text-gray-600">
              AI finds the best job opportunities for you
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Prepare & Apply</h3>
            <p className="text-gray-600">
              Tailor your CV and practice interviews
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">4</span>
            </div>
            <h3 className="font-semibold mb-2">Land Your Job</h3>
            <p className="text-gray-600">Get hired with confidence</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p>Jobs Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <p>Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <p>Interview Success Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2K+</div>
              <p>Placements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Transform Your Career?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of professionals using SprintWork to land their dream
          jobs.
        </p>
        {!isAuthenticated && (
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Journey Today
            </Button>
          </a>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">SprintWork</h3>
              <p className="text-sm">Your AI-powered career companion</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SprintWork. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
