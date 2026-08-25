import fs from "fs";
import path from "path";
import Link from "next/link";
import { FaBook, FaDumbbell, FaLinux, FaGamepad, FaCube, FaArrowLeft } from "react-icons/fa";

const iconMap: Record<string, any> = {
  FaBook,
  FaDumbbell,
  FaLinux,
  FaGamepad,
};

function getProfileData() {
  const profilePath = path.join(process.cwd(), "..", "profile.json");
  return JSON.parse(fs.readFileSync(profilePath, "utf-8"));
}

// Generate static params for the slugs
export async function generateStaticParams() {
  const data = getProfileData();
  const hobbies = data.personal_space?.hobbies || [];
  return hobbies.map((h: any) => ({
    slug: h.slug,
  }));
}

export default async function UniversePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const data = getProfileData();
  const hobbies = data.personal_space?.hobbies || [];
  const item = hobbies.find((h: any) => h.slug === slug);

  if (!item) {
    return (
      <main className="min-h-screen bg-earth-bg flex flex-col items-center justify-center p-6 text-foreground">
        <h1 className="text-2xl mb-4">Página não encontrada</h1>
        <Link href="/" className="text-forest-primary hover:underline">Voltar ao Início</Link>
      </main>
    );
  }

  const Icon = iconMap[item.icon] || FaCube;
  const isHighlight = item.highlight;

  return (
    <main className="min-h-screen bg-earth-bg flex flex-col items-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-forest-primary/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-forest-primary transition-colors mb-12">
          <FaArrowLeft size={14} /> Voltar ao Início
        </Link>
        
        <header className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 border-b border-earth-border/50 pb-8">
          <div className={`p-5 bg-earth-dark/80 rounded-2xl flex-shrink-0 ${isHighlight ? "shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-accent/30" : "shadow-[0_0_15px_rgba(34,197,94,0.15)] border border-forest-primary/30"}`}>
            <Icon className={isHighlight ? "text-amber-accent" : "text-forest-primary"} size={40} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{item.title}</h1>
            <p className="text-foreground/60 text-lg">{item.description}</p>
          </div>
        </header>

        <section className="space-y-8">
          {item.topics && item.topics.length > 0 ? (
            item.topics.map((topic: any, idx: number) => (
              <div key={idx} className="glass-card p-6 md:p-8 rounded-2xl hover:border-forest-primary/40 transition-colors">
                <h2 className="text-xl font-semibold text-foreground/90 mb-3">{topic.title}</h2>
                <p className="text-foreground/70 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-foreground/50 italic">Nenhum detalhe adicional informado.</p>
          )}
        </section>
      </div>
    </main>
  );
}
