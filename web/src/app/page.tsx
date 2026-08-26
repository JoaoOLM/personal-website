import Terminal from "@/components/Terminal";
import Universe from "@/components/Universe";
import Timeline from "@/components/Timeline";
import Experience from "@/components/Experience";
import Image from "next/image";
import { FaGithub, FaLinkedin, FaEnvelope, FaKey, FaQuoteLeft } from "react-icons/fa";
// Fetch profile data from API
async function getProfileData() {
  const apiUrl = process.env.API_URL || "http://127.0.0.1:8000";
  const res = await fetch(`${apiUrl}/api/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getProfileData();
  const profile = data.profile;
  const socials = profile.socials || {};
  const quote = data.personal_space?.quote;
  const hobbies = data.personal_space?.hobbies || [];

  return (
    <main className="min-h-screen bg-earth-bg flex flex-col items-center p-6 md:p-12 selection:bg-forest-primary selection:text-white relative overflow-hidden">
      
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-forest-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-amber-accent/5 blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-forest-primary/3 blur-[200px]"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 z-10 relative">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-forest-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Image 
              src="/images/avatar.png" 
              alt={profile.name} 
              fill 
              sizes="(max-width: 768px) 48px, 48px"
              className="object-cover" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{profile.name.split(' ')[0]}</h1>
            <p className="text-foreground/60">{profile.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-forest-dark/30 shimmer">
            <div className="w-2 h-2 rounded-full bg-forest-primary animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <span className="text-xs text-foreground/80 font-medium">{profile.status}</span>
          </div>
          <a href={process.env.NEXT_PUBLIC_CV_URL || "/cv.pdf"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-accent/40 text-xs text-amber-accent hover:bg-amber-accent/10 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            Baixar Currículo
          </a>
        </div>
      </header>

      {/* Reflexão / Quote */}
      {quote && quote.text && (
        <div className="w-full max-w-4xl mb-12 z-10 relative">
          <blockquote className="glass-card p-6 md:px-10 rounded-2xl border-l-4 border-l-amber-accent/70 relative">
            <FaQuoteLeft className="absolute top-4 left-4 text-earth-border/40" size={24} />
            <p className="text-foreground/90 italic text-lg md:text-xl font-medium mb-2 pl-4">
              "{quote.text}"
            </p>
            <footer className="text-foreground/60 text-sm pl-4 font-[family-name:var(--font-mono)]">
              — {quote.author}
            </footer>
          </blockquote>
        </div>
      )}

      {/* Hero Section with workspace image */}
      <section className="w-full max-w-4xl mb-16 z-10 relative">
        <div className="glass-card rounded-2xl overflow-hidden glow-hover">
          <div className="relative h-48 md:h-64 w-full">
            <Image 
              src="/images/workspace.png" 
              alt="Workspace" 
              fill 
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 896px"
              className="object-cover opacity-70" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-bg via-earth-bg/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-lg md:text-xl font-semibold text-foreground/90">
                {profile.headline.split(',')[0]}
              </p>
              <p className="text-sm text-foreground/60 mt-1">
                {profile.headline.split(',').slice(1).join(',')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Section */}
      <section className="w-full mb-16 z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-xl text-foreground/80 font-[family-name:var(--font-mono)] mb-2">/home/joao/terminal</h2>
          <p className="text-sm text-foreground/50">Interaja com a minha IA pessoal para descobrir mais.</p>
        </div>
        <Terminal data={data.terminal_context} />
      </section>

      {/* Universe Section */}
      <section className="w-full mb-16 relative z-10">
        <Universe items={hobbies} />
      </section>

      {/* Experience Section */}
      {data.current_job && (
        <section className="w-full mb-16 relative z-10">
          <Experience data={data.current_job} />
        </section>
      )}

      {/* Timeline Section */}
      <section className="w-full mb-16 z-10">
        <Timeline data={data.master_degree} />
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl border-t border-earth-border/50 mt-12 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
        <p className="text-foreground/50 text-sm">© {new Date().getFullYear()} {profile.name}. Construído com Next.js & FastAPI.</p>
        <div className="flex gap-3">
          {socials.linkedin && (
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 text-foreground/60 hover:text-forest-primary transition-all glass rounded-full glow-green-hover">
              <FaLinkedin size={18} />
            </a>
          )}
          {socials.github && (
            <a href={socials.github} target="_blank" rel="noopener noreferrer" className="p-2.5 text-foreground/60 hover:text-forest-primary transition-all glass rounded-full glow-green-hover">
              <FaGithub size={18} />
            </a>
          )}
          {socials.email && (
            <a href={`mailto:${socials.email}`} className="p-2.5 text-foreground/60 hover:text-amber-accent transition-all glass rounded-full glow-hover">
              <FaEnvelope size={18} />
            </a>
          )}
          {socials.pgp && (
            <a href="#" className="p-2.5 text-foreground/60 hover:text-amber-accent transition-all glass rounded-full glow-hover" title={`PGP: ${socials.pgp}`}>
              <FaKey size={18} />
            </a>
          )}
        </div>
      </footer>

    </main>
  );
}
