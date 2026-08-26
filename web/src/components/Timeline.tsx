import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

type Phase = {
  id: number;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "in-progress" | "upcoming" | "pending" | "future";
  status_label?: string;
};

type TimelineProps = {
  data: {
    institution: string;
    program: string;
    phases: Phase[];
  };
};

export default function Timeline({ data }: TimelineProps) {
  if (!data) return null;
  const phases = data.phases || [];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 relative">
      <h2 className="text-2xl font-bold mb-10 text-foreground">
        <span className="relative inline-block">
          Linha do Tempo: {data.program} 
          <br />
          {data.institution}
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest-primary/50 to-transparent"></span>
        </span>
      </h2>

      <div className="relative ml-4 md:ml-6 space-y-8">
        {/* Gradient vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-forest-primary via-amber-accent/40 to-earth-border/30"></div>

        {phases.map((phase) => (
          <div key={phase.id} className="relative pl-10 md:pl-12">
            {/* Status Icon */}
            <div className="absolute -left-[13px] top-1">
              {phase.status === "completed" ? (
                <div className="bg-earth-bg p-0.5 rounded-full">
                  <FaCheckCircle className="text-forest-primary drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]" size={24} />
                </div>
              ) : phase.status === "in_progress" ? (
                <div className="bg-earth-bg p-0.5 rounded-full">
                  <FaRegCircle className="text-amber-accent animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={24} />
                </div>
              ) : (
                <div className="bg-earth-bg p-0.5 rounded-full">
                  <FaRegCircle className="text-earth-border" size={24} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`glass-card p-5 rounded-2xl transition-all duration-300 ${
              phase.status === "in_progress"
                ? "border-amber-accent/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                : phase.status === "completed"
                ? "hover:border-forest-primary/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.08)]"
                : "opacity-70"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-foreground/90">{phase.title}</h3>
                  <p className="text-foreground/60 mt-1 text-sm">{phase.description}</p>
                </div>
                {phase.status === "in-progress" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-accent/10 text-amber-accent border border-amber-accent/20 font-medium shimmer">
                    Em Andamento
                  </span>
                )}
                {phase.status === "completed" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-forest-primary/10 text-forest-primary border border-forest-primary/20 font-medium">
                    Concluído
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
