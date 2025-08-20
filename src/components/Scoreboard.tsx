import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  playerWins: number;
  cpuWins: number;
}

export const Scoreboard = ({ playerWins, cpuWins }: ScoreboardProps) => {
  return (
    <Card
      className={cn(
        "p-6 mb-8 rounded-2xl",
        "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg",
        "transition-all duration-500 hover:shadow-[0_0_25px_rgba(236,72,153,0.3)]"
      )}
    >
      <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6 tracking-wide">
        Battle Score
      </h2>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
        {/* Player Score */}
        <div className="text-center">
          <Badge
            className={cn(
              "px-4 py-1 text-sm font-bold mb-3 rounded-full border border-white/20 shadow-md",
              "bg-gradient-to-r from-blue-500/70 to-cyan-400/70 text-white backdrop-blur-md"
            )}
          >
            PLAYER
          </Badge>
          <div className="text-4xl md:text-5xl font-extrabold text-blue-400 drop-shadow-md animate-pulse">
            {playerWins}
          </div>
          <div className="text-sm text-gray-300 mt-1">Wins</div>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-extrabold text-pink-500 animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">
            VS
          </div>
        </div>

        {/* CPU Score */}
        <div className="text-center">
          <Badge
            className={cn(
              "px-4 py-1 text-sm font-bold mb-3 rounded-full border border-white/20 shadow-md",
              "bg-gradient-to-r from-red-500/70 to-pink-500/70 text-white backdrop-blur-md"
            )}
          >
            CPU
          </Badge>
          <div className="text-4xl md:text-5xl font-extrabold text-red-400 drop-shadow-md animate-pulse">
            {cpuWins}
          </div>
          <div className="text-sm text-gray-300 mt-1">Wins</div>
        </div>
      </div>
    </Card>
  );
};
