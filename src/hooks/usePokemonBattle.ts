import { useState, useEffect, useCallback } from "react";

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

interface BattleResult {
  player: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
  };
  cpu: {
    attack: boolean;
    defense: boolean;
    speed: boolean;
  };
  outcome: "player" | "cpu" | "tie"; // NEW explicit outcome
}

type GamePhase = "loading" | "selection" | "ready" | "battling" | "complete" | "error";

export const usePokemonBattle = () => {
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<1 | 2 | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [playerWins, setPlayerWins] = useState(0);
  const [cpuWins, setCpuWins] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>("loading");
  const [error, setError] = useState<string | null>(null);

  // Load scoreboard from localStorage
  useEffect(() => {
    const savedPlayerWins = localStorage.getItem("pokemon-battle-player-wins");
    const savedCpuWins = localStorage.getItem("pokemon-battle-cpu-wins");

    if (savedPlayerWins) setPlayerWins(parseInt(savedPlayerWins));
    if (savedCpuWins) setCpuWins(parseInt(savedCpuWins));
  }, []);

  // Save scoreboard to localStorage
  useEffect(() => {
    localStorage.setItem("pokemon-battle-player-wins", playerWins.toString());
    localStorage.setItem("pokemon-battle-cpu-wins", cpuWins.toString());
  }, [playerWins, cpuWins]);

  // Fetch random Pokémon
  const fetchRandomPokemon = useCallback(async (): Promise<Pokemon> => {
    const randomId = Math.floor(Math.random() * 898) + 1; // Pokémon up to Gen 8
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

    if (!response.ok) throw new Error("Failed to fetch Pokémon");

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other?.["official-artwork"].front_default ||
        data.sprites.front_default,
      stats: {
        attack:
          data.stats.find((stat: { stat: { name: string }; base_stat: number }) => stat.stat.name === "attack")?.base_stat ||
          0,
        defense:
          data.stats.find((stat: { stat: { name: string }; base_stat: number }) => stat.stat.name === "defense")?.base_stat ||
          0,
        speed:
          data.stats.find((stat: { stat: { name: string }; base_stat: number }) => stat.stat.name === "speed")?.base_stat ||
          0,
      },
    };
  }, []);

  // Fetch new battle (two random Pokémon, ensure no duplicates)
  const fetchNewBattle = useCallback(async () => {
    setLoading(true);
    setGamePhase("loading");
    setSelectedFighter(null);
    setBattleResult(null);
    setError(null);

    try {
      const poke1 = await fetchRandomPokemon();
      let poke2 = await fetchRandomPokemon();

      // Ensure different Pokémon
      while (poke1.id === poke2.id) {
        poke2 = await fetchRandomPokemon();
      }

      setPokemon1(poke1);
      setPokemon2(poke2);
      setGamePhase("selection");
    } catch (err) {
      console.error("Error fetching Pokémon:", err);
      setError("Failed to load Pokémon. Please try again.");
      setGamePhase("error");
    } finally {
      setLoading(false);
    }
  }, [fetchRandomPokemon]);

  // Select fighter
  const selectFighter = (fighter: 1 | 2) => {
    setSelectedFighter(fighter);
    setGamePhase("ready");
  };

  // Calculate battle results
  const calculateBattleResult = (player: Pokemon, cpu: Pokemon): BattleResult => {
    const playerStats = {
      attack: player.stats.attack > cpu.stats.attack,
      defense: player.stats.defense > cpu.stats.defense,
      speed: player.stats.speed > cpu.stats.speed,
    };

    const cpuStats = {
      attack: cpu.stats.attack > player.stats.attack,
      defense: cpu.stats.defense > player.stats.defense,
      speed: cpu.stats.speed > player.stats.speed,
    };

    const playerWins = Object.values(playerStats).filter(Boolean).length;
    const cpuWins = Object.values(cpuStats).filter(Boolean).length;

    let outcome: "player" | "cpu" | "tie" = "tie";
    if (playerWins > cpuWins) outcome = "player";
    else if (cpuWins > playerWins) outcome = "cpu";

    return { player: playerStats, cpu: cpuStats, outcome };
  };

  // Start battle
  const startBattle = () => {
    if (!pokemon1 || !pokemon2 || !selectedFighter) return;

    setGamePhase("battling");

    const playerPokemon = selectedFighter === 1 ? pokemon1 : pokemon2;
    const cpuPokemon = selectedFighter === 1 ? pokemon2 : pokemon1;

    const result = calculateBattleResult(playerPokemon, cpuPokemon);

    // Simulate battle delay
    setTimeout(() => {
      setBattleResult(result);
      setGamePhase("complete");

      // Update scoreboard
      if (result.outcome === "player") {
        setPlayerWins((prev) => prev + 1);
      } else if (result.outcome === "cpu") {
        setCpuWins((prev) => prev + 1);
      }
    }, 1500);
  };

  // Reset scoreboard
  const resetScoreboard = () => {
    setPlayerWins(0);
    setCpuWins(0);
    localStorage.removeItem("pokemon-battle-player-wins");
    localStorage.removeItem("pokemon-battle-cpu-wins");
  };

  // Initialize with first battle
  useEffect(() => {
    fetchNewBattle();
  }, [fetchNewBattle]);

  return {
    pokemon1,
    pokemon2,
    loading,
    selectedFighter,
    battleResult,
    playerWins,
    cpuWins,
    gamePhase,
    error,
    fetchNewBattle,
    selectFighter,
    startBattle,
    resetScoreboard,
  };
};
