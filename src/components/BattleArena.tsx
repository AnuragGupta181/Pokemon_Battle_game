"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PokemonCard } from "./PokemonCard";
import { Scoreboard } from "./Scoreboard";
import { usePokemonBattle } from "@/hooks/usePokemonBattle";
import { cn } from "@/lib/utils";

export const BattleArena = () => {
  const {
    pokemon1,
    pokemon2,
    loading,
    selectedFighter,
    battleResult,
    playerWins,
    cpuWins,
    gamePhase,
    fetchNewBattle,
    selectFighter,
    startBattle
  } = usePokemonBattle();

  const [battleAnimation, setBattleAnimation] = useState(false);
  const [resultWinner, setResultWinner] = useState<"player" | "cpu" | "tie" | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [confettiRunning, setConfettiRunning] = useState(false);

  useEffect(() => {
    if (gamePhase === "battling") {
      setBattleAnimation(true);
      const timer = setTimeout(() => {
        setBattleAnimation(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  // when battle completes -> compute winner, show banner, possibly fire confetti
  useEffect(() => {
    if (gamePhase !== "complete" || !battleResult) {
      setBannerVisible(false);
      setResultWinner(null);
      return;
    }

    const playerStatWins = Object.values(battleResult.player).filter(Boolean).length;
    const cpuStatWins = Object.values(battleResult.cpu).filter(Boolean).length;

    let winner: "player" | "cpu" | "tie" = "tie";
    if (playerStatWins > cpuStatWins) winner = "player";
    else if (cpuStatWins > playerStatWins) winner = "cpu";

    setResultWinner(winner);
    setBannerVisible(true);

    // If player wins -> run confetti for ~3s (same style as your example)
    if (winner === "player" && !confettiRunning) {
      setConfettiRunning(true);
      const end = Date.now() + 3 * 1000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > end) {
          setConfettiRunning(false);
          return;
        }

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, battleResult]);

  // Reset banner/confetti when user requests a new battle
  const handleNewBattle = () => {
    setBannerVisible(false);
    setResultWinner(null);
    setConfettiRunning(false);
    fetchNewBattle();
  };

  // Helper to get banner classes & text
  const bannerClasses = resultWinner === "player"
    ? "bg-emerald-500/95 text-white shadow-lg border border-emerald-300/20"
    : resultWinner === "cpu"
    ? "bg-rose-600/95 text-white shadow-lg border border-rose-400/20"
    : "bg-gray-700/95 text-white shadow-lg border border-white/10";

  const bannerText = resultWinner === "player"
    ? "🎉 Player Wins!"
    : resultWinner === "cpu"
    ? "🤖 CPU Wins!"
    : "Draw!";

  return (
    <div className="min-h-screen battle-arena p-4 
      bg-gradient-to-br from-gray-950 via-gray-900 to-black 
      text-white relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Result Banner (top center) */}
      {bannerVisible && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-transform transform ${resultWinner === "player" ? "animate-bounce" : "animate-pulse"}`}>
          <div className={`px-6 py-3 rounded-full text-lg font-bold ${bannerClasses}`}>
            {bannerText}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4 
            bg-gradient-to-r from-fuchsia-400 via-pink-500 to-purple-500 
            bg-clip-text text-transparent drop-shadow-lg">
            Pokémon Battle Arena
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your fighter and battle against the CPU!
          </p>
        </div>

        {/* Scoreboard */}
        <Scoreboard playerWins={playerWins} cpuWins={cpuWins} />

        {/* Battle Controls */}
        <div className="text-center mb-8">
          {gamePhase === "selection" && (
            <Card className="p-6 
              bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 
              shadow-xl hover:shadow-fuchsia-500/20 transition">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Choose Your Fighter!
              </h2>
              <p className="text-muted-foreground mb-2">
                Tap or click on a Pokémon to select it
              </p>
            </Card>
          )}

          {gamePhase === "ready" && (
            <Button
              onClick={startBattle}
              size="lg"
              className="px-8 py-4 rounded-xl 
                bg-gradient-to-r from-fuchsia-500 to-purple-600 
                hover:from-fuchsia-600 hover:to-purple-700 
                shadow-lg hover:shadow-fuchsia-500/40 
                transition-all duration-300 text-lg font-bold"
            >
              ⚡ Start Battle!
            </Button>
          )}

          {gamePhase === "complete" && (
            <div className="space-y-4">
              <Card className="p-6 
                bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                shadow-xl hover:shadow-blue-500/20 transition">
                <h2 className="text-2xl font-bold mb-2">Battle Complete!</h2>
                <p className="text-muted-foreground text-lg">
                  {battleResult &&
                  Object.values(battleResult.player).filter(Boolean).length >
                    Object.values(battleResult.cpu).filter(Boolean).length
                    ? "🎉 Player Wins!"
                    : Object.values(battleResult.cpu).filter(Boolean).length >
                      Object.values(battleResult.player).filter(Boolean).length
                    ? "🤖 CPU Wins!"
                    : "It's a Draw!"}
                </p>
              </Card>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleNewBattle}
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 rounded-xl 
                    border border-fuchsia-400 text-fuchsia-400 
                    hover:bg-fuchsia-500 hover:text-white 
                    shadow-lg hover:shadow-fuchsia-500/40 
                    transition-all duration-300 text-lg font-bold"
                >
                  🔄 New Battle
                </Button>
                <Button
                  onClick={() => {
                    /* immediate replay: start another battle with current pokes (optional) */
                    setBannerVisible(false);
                    setResultWinner(null);
                    startBattle();
                  }}
                  size="lg"
                  className="px-6 py-3 rounded-xl bg-slate-700/40 hover:bg-slate-700/60"
                >
                  Replay
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pokémon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          {/* Player Side */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-400">
              {selectedFighter === 1 ? "Your Fighter" : "Choose Fighter"}
            </h3>
            <PokemonCard
              pokemon={pokemon1}
              isSelected={selectedFighter === 1}
              isPlayer={true}
              onClick={() => gamePhase === "selection" && selectFighter(1)}
              className={cn(
                "transition-transform duration-300 hover:scale-105",
                battleAnimation && "battle-animation"
              )}
              battleResult={battleResult?.player}
              showStats={gamePhase === "complete"}
            />
          </div>

          {/* CPU Side */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              {selectedFighter === 2
                ? "Your Fighter"
                : selectedFighter === 1
                ? "CPU Fighter"
                : "Choose Fighter"}
            </h3>
            <PokemonCard
              pokemon={pokemon2}
              isSelected={selectedFighter === 2 || selectedFighter === 1}
              isPlayer={selectedFighter === 2}
              onClick={() => gamePhase === "selection" && selectFighter(2)}
              className={cn(
                "transition-transform duration-300 hover:scale-105",
                battleAnimation && "battle-animation"
              )}
              battleResult={battleResult?.cpu}
              showStats={gamePhase === "complete"}
            />
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md 
            flex items-center justify-center z-50">
            <Card className="p-8 text-center bg-white/10 backdrop-blur-xl 
              rounded-2xl border border-white/20 shadow-2xl">
              <div className="animate-spin w-12 h-12 border-4 border-fuchsia-400 border-t-transparent rounded-full mx-auto mb-6"></div>
              <p className="text-lg font-medium text-white">
                Loading new Pokémon...
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
