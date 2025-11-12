// App.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { indexedDbService } from './services/indexedDbService';
import { pokemonApiService } from './services/pokemonApiService';
import { Pokemon, TokenBalance, AppMessage, PokemonStatus, PokemonRarity } from './types';
import Button from './components/Button';
import Modal from './components/Modal';
import WelcomeModal from './components/WelcomeModal';
import { Coins, Sparkles, RefreshCw, XCircle, Gem, Loader2, Trophy } from 'lucide-react';

const GENERATION_COST = 10;

const getRarityResellValue = (rarity: PokemonRarity): number => {
  switch (rarity) {
    case PokemonRarity.S_PLUS: return 25;
    case PokemonRarity.S: return 15;
    case PokemonRarity.A: return 10;
    case PokemonRarity.B: return 5;
    case PokemonRarity.C: return 4;
    case PokemonRarity.D: return 3;
    case PokemonRarity.E: return 2;
    case PokemonRarity.F: return 1;
    default: return 1;
  }
};

const rarityOrderMap: Record<PokemonRarity, number> = {
  [PokemonRarity.S_PLUS]: 7,
  [PokemonRarity.S]: 6,
  [PokemonRarity.A]: 5,
  [PokemonRarity.B]: 4,
  [PokemonRarity.C]: 3,
  [PokemonRarity.D]: 2,
  [PokemonRarity.E]: 1,
  [PokemonRarity.F]: 0,
};

const App: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingPokemon, setIsGeneratingPokemon] = useState<boolean>(false);
  const [message, setMessage] = useState<AppMessage | null>(null);
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [isModalConfirmLoading, setIsModalConfirmLoading] = useState<boolean>(false);
  const [pokemonToResellId, setPokemonToResellId] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const showMessage = useCallback((type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  const fetchAppData = useCallback(async () => {
    setIsLoading(true);
    try {
      await indexedDbService.openDatabase();
      const fetchedPokemons = await indexedDbService.getPokemons();
      setPokemons(fetchedPokemons);
      
      const balance = await indexedDbService.getTokenBalance();
      setTokenBalance(balance.amount);
      setMessage(null);
    } catch (error) {
      console.error("Failed to fetch app data:", error);
      showMessage('error', 'Failed to load app data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const handleGeneratePokemon = async () => {
    if (tokenBalance < GENERATION_COST) {
      showMessage('warning', `You need ${GENERATION_COST} tokens to generate a Pokémon. Current balance: ${tokenBalance}.`);
      return;
    }

    setIsGeneratingPokemon(true);
    let originalTokenBalance = tokenBalance;
    
    try {
      const newBalanceAfterDeduction = originalTokenBalance - GENERATION_COST;
      setTokenBalance(newBalanceAfterDeduction);
      await indexedDbService.updateTokenBalance(newBalanceAfterDeduction);
      
      const newPokemon = await pokemonApiService.generatePokemon();
      await indexedDbService.addPokemon(newPokemon);
      setPokemons((prevPokemons) => [newPokemon, ...prevPokemons]);
      showMessage('success', `Awesome! You generated a new Pokémon: ${newPokemon.name} (${newPokemon.rarity})!`);
      
    } catch (error) {
      console.error("Error generating Pokémon:", error);
      const revertedBalance = originalTokenBalance;
      setTokenBalance(revertedBalance);
      await indexedDbService.updateTokenBalance(revertedBalance);
      showMessage('error', `Failed to generate Pokémon: ${error instanceof Error ? error.message : String(error)}. Tokens refunded.`);
    } finally {
      setIsGeneratingPokemon(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPokemonToResellId(null);
    setModalTitle('');
    setModalContent(null);
    setModalOnConfirm(undefined);
    setIsModalConfirmLoading(false);
  };

  const handleResellConfirmation = (pokemonId: string, pokemonName: string) => {
    const pokemonToConfirm = pokemons.find(p => p.id === pokemonId);
    if (!pokemonToConfirm) {
      showMessage('error', 'Could not find the Pokémon to resell.');
      return;
    }
    
    const resellValue = getRarityResellValue(pokemonToConfirm.rarity);

    setPokemonToResellId(pokemonId);
    setModalTitle('Resell Pokémon');
    setModalContent(
      <p className="text-gray-300">
        Are you sure you want to resell <span className="font-semibold text-cyan-400">{pokemonName}</span>?
        You will receive <span className="font-bold text-green-400">{resellValue} tokens</span> back. This action cannot be undone.
      </p>
    );
    const onConfirmAction = () => {
      (async () => {
        setIsModalConfirmLoading(true);
        try {
          const pokemonToResell = pokemons.find(p => p.id === pokemonId);
          if (pokemonToResell) {
            const updatedPokemon = { ...pokemonToResell, status: PokemonStatus.RESOLD };
            await indexedDbService.updatePokemon(updatedPokemon);
            
            const currentResellValue = getRarityResellValue(pokemonToResell.rarity);
            const newBalance = tokenBalance + currentResellValue;
            await indexedDbService.updateTokenBalance(newBalance);

            setPokemons((prevPokemons) =>
              prevPokemons.map((p) => (p.id === updatedPokemon.id ? updatedPokemon : p)),
            );
            setTokenBalance(newBalance);
            
            showMessage('success', `${pokemonToResell.name} resold successfully! You gained ${currentResellValue} tokens.`);
          }
        } catch (error) {
          console.error("Error reselling Pokémon:", error);
          showMessage('error', `Failed to resell Pokémon: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setIsModalConfirmLoading(false);
          closeModal();
        }
      })();
    };
    setModalOnConfirm(() => onConfirmAction);
    setIsModalOpen(true);
  };
  
  const getRarityStyles = useCallback((rarity: PokemonRarity) => {
    switch (rarity) {
      case PokemonRarity.F: return { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-600' };
      case PokemonRarity.E: return { bg: 'bg-gray-600', text: 'text-gray-200', border: 'border-gray-500' };
      case PokemonRarity.D: return { bg: 'bg-blue-900', text: 'text-blue-300', border: 'border-blue-700' };
      case PokemonRarity.C: return { bg: 'bg-green-900', text: 'text-green-300', border: 'border-green-700' };
      case PokemonRarity.B: return { bg: 'bg-purple-900', text: 'text-purple-300', border: 'border-purple-700' };
      case PokemonRarity.A: return { bg: 'bg-yellow-900', text: 'text-yellow-300', border: 'border-yellow-700' };
      case PokemonRarity.S: return { bg: 'bg-orange-900', text: 'text-orange-300', border: 'border-orange-700' };
      case PokemonRarity.S_PLUS: return { bg: 'bg-red-900', text: 'text-red-300 font-bold', border: 'border-red-600 shadow-neon-pink' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700' };
    }
  }, []);
  
  const pokedexScore = useMemo(() => {
    return pokemons.reduce((score, pokemon) => {
      if (pokemon.status === PokemonStatus.OWNED) {
        return score + 5; 
      }
      if (pokemon.status === PokemonStatus.RESOLD) {
        return score + 1; 
      }
      return score;
    }, 0);
  }, [pokemons]);

  const sortedPokemons = useMemo(() => {
    const pokemonsToSort = [...pokemons];
    switch (sortOrder) {
      case 'rarity-desc':
        return pokemonsToSort.sort((a, b) => rarityOrderMap[b.rarity] - rarityOrderMap[a.rarity]);
      case 'rarity-asc':
        return pokemonsToSort.sort((a, b) => rarityOrderMap[a.rarity] - rarityOrderMap[b.rarity]);
      case 'name-asc':
        return pokemonsToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return pokemonsToSort.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-asc':
        return pokemonsToSort.sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());
      case 'date-desc':
      default:
        return pokemonsToSort.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }
  }, [pokemons, sortOrder]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      <h1 className="text-4xl sm:text-5xl font-black text-center mb-10 text-cyan-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] uppercase tracking-widest">
        Pokémon Neon Nexus
      </h1>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg border-2 flex items-center justify-between transition-opacity duration-300 ${
            message.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-300' :
            message.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-300' :
            'bg-yellow-900/50 border-yellow-500 text-yellow-300'
          }`}
          role="alert"
        >
          <p className="font-semibold">{message.text}</p>
          <Button variant="ghost" size="sm" onClick={() => setMessage(null)}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900/50 border-2 border-cyan-500/30 p-4 sm:p-6 rounded-xl shadow-lg flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center gap-3 uppercase">
            <Gem className="h-7 w-7 text-cyan-500" />
            Tokens:
          </h2>
          <span className="text-3xl sm:text-4xl font-black text-white leading-none">
            {tokenBalance}
          </span>
        </div>
        
        <div className="bg-gray-900/50 border-2 border-pink-500/30 p-4 sm:p-6 rounded-xl shadow-lg flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-pink-400 flex items-center gap-3 uppercase">
            <Trophy className="h-7 w-7 text-pink-500" />
            Pokédex Score:
          </h2>
          <span className="text-3xl sm:text-4xl font-black text-white leading-none">
            {pokedexScore}
          </span>
        </div>
      </div>

      <div className="bg-black/30 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700 mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white uppercase">
          Generate New Pokémon
        </h2>
        <p className="text-gray-400 mb-6">
          Forge a unique Pokémon in the digital ether!
          (Cost: <span className="font-semibold text-pink-500">{GENERATION_COST} Tokens</span>)
        </p>
        <Button
          onClick={handleGeneratePokemon}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto flex items-center justify-center gap-2"
          disabled={isGeneratingPokemon || isLoading || tokenBalance < GENERATION_COST}
        >
          {isGeneratingPokemon ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Generating...
            </span>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center sm:text-left mb-4 sm:mb-0 uppercase">Your Collection</h2>
        {pokemons.length > 1 && (
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <label htmlFor="sort-order" className="text-gray-400 font-medium text-sm">Sort by:</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded-md shadow-sm pl-3 pr-8 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="rarity-desc">Rarity (High to Low)</option>
              <option value="rarity-asc">Rarity (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-10 w-10 text-cyan-500" />
          <p className="ml-4 text-lg text-gray-400">Loading your collection...</p>
        </div>
      ) : sortedPokemons.length === 0 ? (
        <div className="text-center text-gray-500 text-xl py-12 bg-black/20 rounded-xl border border-gray-700">
          <p>Your collection is empty.</p>
          <p>Generate your first Pokémon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPokemons.map((pokemon) => {
            const { bg, text, border } = getRarityStyles(pokemon.rarity);
            const resellValue = getRarityResellValue(pokemon.rarity);
            return (
              <div key={pokemon.id} className={`bg-gray-900/70 p-4 rounded-xl shadow-lg border-2 ${border} hover:shadow-lg transition-all duration-300 flex flex-col hover:scale-105 hover:!border-cyan-400`}>
                <div className="flex-grow">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${pokemon.imageBase64}`}
                      alt={pokemon.name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                    {pokemon.status === PokemonStatus.RESOLD && (
                      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white text-lg font-bold uppercase tracking-widest">
                        RESOLD
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white truncate">
                      {pokemon.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${bg} ${text}`}>
                      {pokemon.rarity}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
                  <span>{new Date(pokemon.generatedAt).toLocaleDateString()}</span>
                  {pokemon.status === PokemonStatus.OWNED ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResellConfirmation(pokemon.id, pokemon.name)}
                      aria-label={`Resell ${pokemon.name} for ${resellValue} tokens`}
                    >
                      <Coins className="h-4 w-4 mr-1" /> Resell (+{resellValue})
                    </Button>
                  ) : (
                    <span className="text-pink-500 flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" /> Resold
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        onConfirm={modalOnConfirm}
        confirmButtonText="Resell"
        cancelButtonText="Cancel"
        confirmButtonVariant="danger"
        isLoading={isModalConfirmLoading}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default App;
