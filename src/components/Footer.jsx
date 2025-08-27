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
            <a href="#" className="block hover:text-white transition-colors text-sm">Descripción de audio</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Centro de ayuda</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Tarjetas de regalo</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Centro de prensa</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Relaciones con inversionistas</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Empleos</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Términos de uso</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Privacidad</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Avisos legales</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Preferencias de cookies</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Información corporativa</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Contáctanos</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block hover:text-white transition-colors text-sm">Prueba de velocidad</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Solo en PixelFlix</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Originales</a>
            <a href="#" className="block hover:text-white transition-colors text-sm">Centro K-Content</a>
          </div>
        </div>

        {/* Service Code Button */}
        <div className="mb-6">
          <button className="border border-gray-600 text-gray-400 px-4 py-2 text-sm hover:border-white hover:text-white transition-colors">
            Código de servicio
          </button>
        </div>

        {/* Copyright */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>© 2025 PixelFlix, Inc.</p>
          <p>PixelFlix Colombia - Mira series y películas online</p>
          <p>
            Disfruta lo mejor del entretenimiento con nuestra amplia colección.
            Descubre tu próxima serie favorita hoy.
          </p>
        </div>
      </div>
    </footer>
  );
}