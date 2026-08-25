import { FaBook, FaDumbbell, FaLinux, FaGamepad, FaCube } from "react-icons/fa";
import Link from "next/link";

const iconMap: Record<string, any> = {
  FaBook: FaBook,
  FaDumbbell: FaDumbbell,
  FaLinux: FaLinux,
  FaGamepad: FaGamepad,
};

type UniverseItem = {
  slug: string;
  icon: string;
  title: string;
  description: string;
  highlight: boolean;
};

export default function Universe({ items }: { items: UniverseItem[] }) {
  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-8 text-center text-foreground">
        <span className="relative inline-block">
          Universo Pessoal
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-accent/50 to-transparent"></span>
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((card, idx) => {
          const Icon = iconMap[card.icon] || FaCube;
          return (
            <Link key={idx} href={`/universe/${card.slug}`}>
              <div
                className={`glass-card p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 h-full ${
                  card.highlight ? "border-amber-accent/30 glow-hover" : "glow-green-hover hover:border-forest-primary/30"
                }`}
              >
                <div className={`p-3 bg-earth-dark/80 rounded-xl flex-shrink-0 ${card.highlight ? "shadow-[0_0_10px_rgba(245,158,11,0.15)]" : "shadow-[0_0_10px_rgba(34,197,94,0.1)]"}`}>
                  <Icon className={card.highlight ? "text-amber-accent" : "text-forest-primary"} size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground/90">{card.title}</h3>
                  <p className="text-foreground/60 mt-2 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
