import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Social Media Icons */}
        <div className="flex space-x-6 mb-8">
          <Facebook className="w-6 h-6 cursor-pointer hover:text-white transition-colors" />
          <Instagram className="w-6 h-6 cursor-pointer hover:text-white transition-colors" />
          <Twitter className="w-6 h-6 cursor-pointer hover:text-white transition-colors" />
          <Youtube className="w-6 h-6 cursor-pointer hover:text-white transition-colors" />
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Audio Description</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Help Center</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Gift Cards</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Media Center</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Investor Relations</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Jobs</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Terms of Use</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Privacy</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Legal Notices</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Cookie Preferences</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Corporate Information</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Contact Us</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Speed Test</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Only on Netflix</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Originals</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">K-Content Hub</a>
          </div>
        </div>

        {/* Service Code Button */}
        <div className="mb-6">
          <button className="border border-gray-600 text-gray-400 px-4 py-2 text-sm hover:border-white hover:text-white transition-colors">
            Service Code
          </button>
        </div>

        {/* Copyright */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>© 2025 PixelFlix, Inc.</p>
          <p>PixelFlix Colombia - Watch TV Shows Online, Watch Movies Online</p>
          <p>
            Experience the best of Korean entertainment with our extensive collection of K-dramas, 
            from heart-fluttering romances to edge-of-your-seat thrillers. Discover your next favorite series today.
          </p>
        </div>
      </div>
    </footer>
  );
}