import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/shared/components/Footer";

const BACKGROUND_URL =
  "https://assets.nflxext.com/ffe/siteui/vlv3/3e4bd046-85a3-40e1-842d-fa11cec84349/web/CO-es-20250818-TRIFECTA-perspective_783420e1-1a07-4c2a-9f3c-585857c3ec6c_large.jpg";

export const authCardClass =
  "w-[22rem] md:w-[24rem] rounded-2xl border border-white/10 bg-black/60 p-8 md:p-10 shadow-2xl backdrop-blur-md";
export const authInputClass =
  "w-full h-12 rounded-md border border-white/20 bg-white/10 px-4 text-white placeholder-white/50 outline-none transition focus:border-[#e50914]";
export const authPrimaryButtonClass =
  "flex w-full h-12 items-center justify-center rounded-md bg-[#e50914] font-semibold transition hover:bg-[#f6121d] hover:shadow-[0_8px_24px_rgba(229,9,20,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none";
export const authSecondaryButtonClass =
  "flex w-full h-12 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] font-semibold transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60";

export function AuthAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const colors =
    tone === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-300"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-4 rounded-md border px-3 py-2 ${colors}`}>
      {children}
    </div>
  );
}

/** Fondo, logo y pie comunes a las pantallas de acceso. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <div className="relative flex-1">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${BACKGROUND_URL}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-10"></div>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent z-10"></div>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent z-10"></div>

        <div className="absolute top-0 left-0 w-full flex justify-start z-20">
          <Link
            to="/login"
            className="font-bold text-3xl md:text-5xl tracking-tight m-6 drop-shadow-lg"
            style={{ color: "#e50914", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            PixelFlix
          </Link>
        </div>

        <div className="relative z-20 flex items-center justify-center min-h-screen">
          {children}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>
      </div>

      <Footer className="bg-black" />
    </div>
  );
}
