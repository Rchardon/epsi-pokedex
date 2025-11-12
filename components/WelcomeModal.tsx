// components/WelcomeModal.tsx

import React from 'react';
import { Gem, Sparkles, Coins, Trophy } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to the Lab!">
      <div className="space-y-6">
        <p>
          You are about to enter the Pokémon Neon Nexus, a lab where you can generate unique Pokémon using cutting-edge AI!
        </p>
        
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-cyan-400 uppercase">How It Works</h4>
          <ul className="list-none space-y-3">
            <li className="flex items-start gap-3">
              <Gem className="h-6 w-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <strong>Starting Tokens:</strong> You begin your journey with <span className="font-bold text-white">100 tokens</span>. Use them wisely!
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <strong>Generate Pokémon:</strong> Each generation costs <span className="font-bold text-white">10 tokens</span> and brings a new, completely unique Pokémon into existence.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Coins className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <strong>Resell for Profit:</strong> You can resell any Pokémon from your collection. The number of tokens you get back depends on its <span className="font-bold text-white">rarity</span>. Rarer Pokémon are worth more!
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <strong>Build Your Pokédex Score:</strong> Every Pokémon you generate adds to your score. Keeping them in your collection gives you more points than reselling them.
              </div>
            </li>
          </ul>
        </div>
        
        <p>
          Your entire collection and token balance are saved directly in your browser, so you can play offline.
        </p>
        
        <div className="pt-4 text-center">
          <Button onClick={onClose} size="lg" variant="primary">
            Enter the Lab
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
