import { MagicCard } from "@/components/magicui/magic-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
}

interface PokemonCardProps {
  pokemon: Pokemon | null;
  isSelected?: boolean;
  isPlayer?: boolean;
  onClick?: () => void;
  className?: string;
  battleResult?: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
  };
  showStats?: boolean;
}

export const PokemonCard = ({
  pokemon,
  isSelected = false,
  isPlayer = false,
  onClick,
  className,
  battleResult,
  showStats = false,
}: PokemonCardProps) => {
  if (!pokemon) {
    return (
      <MagicCard
        className={cn(
          "pokemon-card h-80 sm:h-96 w-full max-w-xs flex items-center justify-center",
          "animate-pulse",
          className
        )}
      >
        <div className="text-muted-foreground">Loading...</div>
      </MagicCard>
    );
  }

  return (
    <MagicCard
      className={cn(
        "pokemon-card h-80 sm:h-96 w-full max-w-xs relative overflow-hidden",
        "transition-all duration-300 hover:scale-105",
        "bg-black", // Consistent card theme
        isSelected && (isPlayer ? "ring-2 ring-player" : "ring-2 ring-cpu"),
        isPlayer ? "slide-in-left" : "slide-in-right",
        "border border-white/10 backdrop-blur-xl rounded-xl shadow-lg", // ✅ visible in dark theme
        className
      )}
    >
      <div
        className="h-full w-full p-6 cursor-pointer flex flex-col text-white" // Adjusted text color
        onClick={onClick} // ✅ click now works
      >
        {/* Pokémon Image */}
        <div className="flex justify-center mb-4">
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
          />
        </div>

        {/* Pokémon Name */}
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 capitalize text-white">
          {pokemon.name}
        </h3>

        {/* Team Badge */}
        {isSelected && (
          <Badge
            variant="secondary"
            className={cn(
              "absolute top-4 right-4",
              isPlayer
                ? "bg-player text-white" // Adjusted badge text color
                : "bg-cpu text-white" // Adjusted badge text color
            )}
          >
            {isPlayer ? "PLAYER" : "CPU"}
          </Badge>
        )}

        {/* Stats */}
        {showStats && (
          <div className="space-y-3">
            <StatBar
              label="Attack"
              value={pokemon.stats.attack}
              isWinner={battleResult?.attack}
              theme={isPlayer ? "player" : "cpu"}
            />
            <StatBar
              label="Defense"
              value={pokemon.stats.defense}
              isWinner={battleResult?.defense}
              theme={isPlayer ? "player" : "cpu"}
            />
            <StatBar
              label="Speed"
              value={pokemon.stats.speed}
              isWinner={battleResult?.speed}
              theme={isPlayer ? "player" : "cpu"}
            />
          </div>
        )}
      </div>
    </MagicCard>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  isWinner?: boolean;
  theme: "player" | "cpu";
}

const StatBar = ({ label, value, isWinner, theme }: StatBarProps) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-white">{label}</span> {/* Adjusted label text color */}
      <span
        className={cn(
          "text-sm font-bold",
          isWinner && "text-winner",
          theme === "player" && "text-player",
          theme === "cpu" && "text-cpu"
        )}
      >
        {value}
      </span>
    </div>
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          isWinner ? "bg-winner" : theme === "player" ? "bg-player" : "bg-cpu"
        )}
        style={{ width: `${Math.min(100, (value / 150) * 100)}%` }}
      />
    </div>
  </div>
);
