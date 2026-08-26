import { FaBuilding, FaCheck } from "react-icons/fa";

type Highlight = {
  title: string;
  description: string;
};

type ExperienceProps = {
  data: {
    company: string;
    role: string;
    description: string;
    highlights: Highlight[];
  };
};

export default function Experience({ data }: ExperienceProps) {
  if (!data) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 relative">
      <h2 className="text-2xl font-bold mb-10 text-foreground">
        <span className="relative inline-block">
          Experiência Profissional
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-accent/50 to-transparent"></span>
        </span>
      </h2>

      <div className="glass-card p-6 md:p-8 rounded-2xl border-l-4 border-l-amber-accent relative overflow-hidden group hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] transition-all duration-300">
        
        {/* Subtle background element */}
        <div className="absolute -right-10 -top-10 text-amber-accent/5 group-hover:text-amber-accent/10 transition-colors duration-500">
          <FaBuilding size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 border-b border-earth-border/50 pb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-amber-accent transition-colors">
                {data.role}
              </h3>
              <p className="text-foreground/70 text-lg mt-1 flex items-center gap-2">
                <FaBuilding className="text-amber-accent/70" />
                {data.company}
              </p>
            </div>
            <div className="mt-3 md:mt-0 inline-flex items-center px-3 py-1 rounded-full bg-forest-primary/10 text-forest-primary text-sm font-medium border border-forest-primary/20">
              Atualmente
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed mb-6">
            {data.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.highlights.map((highlight, idx) => (
              <div key={idx} className="bg-earth-bg/50 p-4 rounded-xl border border-earth-border/40 hover:border-amber-accent/30 transition-colors">
                <h4 className="font-semibold text-foreground/90 flex items-start gap-2 mb-2">
                  <span className="text-forest-primary mt-1"><FaCheck size={12} /></span>
                  {highlight.title}
                </h4>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
