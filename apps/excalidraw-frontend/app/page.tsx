import { Button } from "@/components/ui/button";
import { ArrowRight, Infinity, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import pic from "@/public/preveiw.png";

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed w-full bg-white/80 backdrop-blur-sm border-b z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">
                  PlayGrounds
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/signin">
                  <Button variant="ghost" className="text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Collaborate in
                <span className="text-blue-600"> Real-Time</span>
                <br />
                on an Infinite Canvas
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience seamless collaboration with your team on our infinite
                digital whiteboard. Draw, plan, and create together in
                real-time.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                    Get Started Free
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Preview Image */}
            <div className="mt-16 rounded-lg overflow-hidden shadow-2xl border">
              <Image
                src={pic}
                alt="PlayGrounds Interface"
                className="w-full object-cover"
                width={1000}
                height={500}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Real-Time Collaboration
                </h3>
                <p className="text-gray-600">
                  Work together with your team in real-time. See changes
                  instantly as they happen.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Infinity className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Infinite Canvas</h3>
                <p className="text-gray-600">
                  Never run out of space. Our infinite canvas grows with your
                  ideas.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Experience smooth performance with our optimized real-time
                  sync engine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-gray-500">
                © 2024 PlayGrounds. All rights reserved.
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Terms
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Privacy
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
