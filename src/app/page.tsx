import Link from "next/link";
import { ArrowRight, Check, Cloud, Shield, Zap, Menu } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] text-gray-900 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-xl font-bold tracking-tight">CloudStore</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#enterprise" className="hover:text-gray-900 transition-colors">Enterprise</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:block font-medium text-gray-900 hover:text-blue-600 transition-colors">
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-16 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Do more with your <br />
            <span className="text-blue-600">digital life.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
            Securely store, organize, and share all your files from one place.
            Experience the future of cloud storage designed for 2026.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-xl hover:bg-black transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start for free <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-lg font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center">
              View Demo
            </button>
          </div>
        </div>
      </header>

      {/* Geometric Abstract Visual (Dropbox style) */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full overflow-hidden opacity-10 pointer-events-none hidden lg:block">
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Cloud Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your files from any device, anywhere. Real-time synchronization keeps everything up to date.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure Vault</h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade encryption ensures your sensitive documents remain private and protected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors duration-300">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fast Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Share large files with a simple link. Control access permissions and track downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Social Proof */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by modern teams</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Nebula', 'FoxRun', 'Circle'].map((brand) => (
              <span key={brand} className="text-2xl font-bold">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500">© 2026 CloudStore Inc. All rights reserved.</p>
          <div className="flex gap-6 text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
