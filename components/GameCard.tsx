import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  link?: string;
  isLocked?: boolean;
  bgGradient?: string;
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  icon, 
  link, 
  isLocked = false,
  bgGradient = 'bg-gray-600' 
}) => {
  const CardContent = (
    <>
      <div className={`h-48 flex justify-center items-center text-6xl ${bgGradient} ${isLocked ? 'grayscale opacity-60' : ''}`}>
        {icon}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-bg">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
          {description}
        </p>
        {!isLocked && (
          <span className="inline-block mt-auto self-start px-5 py-2 bg-primary text-white rounded-full font-bold text-sm transition-colors hover:bg-indigo-700">
            開始遊戲 ▶
          </span>
        )}
        {isLocked && (
          <div className="mt-auto text-gray-400 text-xs uppercase tracking-wider font-semibold">
            Locked
          </div>
        )}
      </div>
    </>
  );

  if (isLocked || !link) {
    return (
      <div className="bg-card rounded-2xl overflow-hidden transition-all duration-300 relative flex flex-col cursor-not-allowed opacity-80">
        {CardContent}
      </div>
    );
  }

  return (
    <Link 
      to={link} 
      className="bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative flex flex-col group decoration-transparent"
    >
      {CardContent}
    </Link>
  );
};

export default GameCard;