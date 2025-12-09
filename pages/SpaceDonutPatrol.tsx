import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GameEntity, Particle } from '../types';
import { generateMissionBriefing } from '../services/geminiService';
import { ArrowLeft, RefreshCw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const PLAYER_SIZE = 50;

const SpaceDonutPatrol: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [briefing, setBriefing] = useState<string>("Initializing Donut Systems...");
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // Dynamic Game Dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const gameDimensionsRef = useRef({ width: 800, height: 600 });

  // Game State Refs
  const requestRef = useRef<number>(0);
  const playerRef = useRef<GameEntity>({ x: 100, y: 300, width: PLAYER_SIZE, height: PLAYER_SIZE, speed: 5, type: 'player', emoji: '🍩' });
  const obstaclesRef = useRef<GameEntity[]>([]);
  const collectiblesRef = useRef<GameEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysPressed = useRef<Set<string>>(new Set());
  const frameCount = useRef(0);
  const speedMultiplier = useRef(1);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      // Default / Max dimensions
      let newWidth = 800;
      let newHeight = 600;

      if (window.innerWidth < 850) {
        // Mobile / Tablet logic: Fill width with some padding
        newWidth = window.innerWidth - 32; 
        // Adjust height based on available vertical space, keeping some room for controls/header
        // But clamp it reasonable values
        newHeight = Math.min(window.innerHeight - 200, 600);
        if (newHeight < 400) newHeight = 400; // Minimum playable height
      }

      setDimensions({ width: newWidth, height: newHeight });
      gameDimensionsRef.current = { width: newWidth, height: newHeight };
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Input Handling (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch Controls Handlers
  const handleTouchStart = (key: string) => {
    // Prevent default to stop scrolling/selection when playing
    keysPressed.current.add(key);
  };
  const handleTouchEnd = (key: string) => {
    keysPressed.current.delete(key);
  };

  const spawnEntity = useCallback(() => {
    const { width, height } = gameDimensionsRef.current;
    
    if (Math.random() < 0.02 * speedMultiplier.current) {
      // Spawn Obstacle
      obstaclesRef.current.push({
        x: width,
        y: Math.random() * (height - 50),
        width: 40,
        height: 40,
        speed: (3 + Math.random() * 3) * speedMultiplier.current,
        type: 'enemy',
        emoji: Math.random() > 0.5 ? '🗑️' : '🪨'
      });
    }
    if (Math.random() < 0.03) {
      // Spawn Collectible
      collectiblesRef.current.push({
        x: width,
        y: Math.random() * (height - 40),
        width: 30,
        height: 30,
        speed: 3 * speedMultiplier.current,
        type: 'collectible',
        emoji: '✨'
      });
    }
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const update = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const { width, height } = gameDimensionsRef.current;

    frameCount.current++;
    if (frameCount.current % 600 === 0) {
      speedMultiplier.current += 0.1; // Increase difficulty
    }

    // Player Movement
    const player = playerRef.current;
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) player.y -= player.speed;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) player.y += player.speed;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) player.x -= player.speed;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) player.x += player.speed;

    // Boundaries (Dynamic)
    player.x = Math.max(0, Math.min(width - player.width, player.x));
    player.y = Math.max(0, Math.min(height - player.height, player.y));

    // Update Entities
    spawnEntity();

    // Move & Filter Obstacles
    obstaclesRef.current.forEach(obs => obs.x -= obs.speed);
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -50);

    // Move & Filter Collectibles
    collectiblesRef.current.forEach(col => col.x -= col.speed);
    collectiblesRef.current = collectiblesRef.current.filter(col => col.x > -50);

    // Collision Detection
    // 1. Obstacles (Game Over)
    for (const obs of obstaclesRef.current) {
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        endGame();
        return;
      }
    }

    // 2. Collectibles (Score)
    for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
      const col = collectiblesRef.current[i];
      if (
        player.x < col.x + col.width &&
        player.x + player.width > col.x &&
        player.y < col.y + col.height &&
        player.y + player.height > col.y
      ) {
        setScore(prev => prev + 100);
        createExplosion(col.x, col.y, '#ffd700');
        collectiblesRef.current.splice(i, 1);
      }
    }

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

  }, [isPlaying, gameOver, spawnEntity]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = gameDimensionsRef.current;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw Background (Simple Starfield effect)
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    for (let i = 0; i < 20; i++) {
        const x = (frameCount.current * 0.5 + i * 50) % width;
        const y = (i * 37) % height;
        ctx.fillRect(x, y, 2, 2);
    }

    // Draw Player
    const p = playerRef.current;
    ctx.font = `${PLAYER_SIZE}px serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(p.emoji, p.x, p.y);

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.font = `${obs.height}px serif`;
      ctx.fillText(obs.emoji, obs.x, obs.y);
    });

    // Draw Collectibles
    collectiblesRef.current.forEach(col => {
      ctx.font = `${col.height}px serif`;
      ctx.fillText(col.emoji, col.x, col.y);
    });

    // Draw Particles
    particlesRef.current.forEach(part => {
      ctx.globalAlpha = part.life;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

  }, []);

  const gameLoop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  const startGame = () => {
    const { width, height } = gameDimensionsRef.current;
    // Reset State
    playerRef.current = { x: 50, y: height / 2 - PLAYER_SIZE / 2, width: PLAYER_SIZE, height: PLAYER_SIZE, speed: 5, type: 'player', emoji: '🍩' };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    keysPressed.current.clear();
    frameCount.current = 0;
    speedMultiplier.current = 1;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const endGame = async () => {
    setGameOver(true);
    setIsPlaying(false);
    if (score > highScore) setHighScore(score);
    
    // Generate AI Briefing
    setLoadingBriefing(true);
    const msg = await generateMissionBriefing(score);
    setBriefing(msg);
    setLoadingBriefing(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-2 md:p-4 touch-none">
      
      {/* HUD */}
      <div className="w-full max-w-[800px] flex flex-wrap justify-between items-center mb-2 md:mb-4 gap-2">
        <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors text-sm md:text-base">
          <ArrowLeft className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" /> Back
        </Link>
        <div className="flex gap-4">
          <div className="text-xl md:text-2xl font-bold font-mono text-primary">SCORE: {score.toString().padStart(6, '0')}</div>
          <div className="flex items-center text-yellow-400 text-sm md:text-base">
             <Trophy className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5"/> {highScore}
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div 
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 bg-black max-w-full"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="block bg-[#0b0f19]"
        />

        {/* Start Screen Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-4">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-4 drop-shadow-lg">
              SPACE DONUT PATROL
            </h1>
            <p className="text-gray-300 mb-6 max-w-md text-sm md:text-lg">
              Pilot the S.S. Glaze. Collect Star Sugar ✨. Avoid Space Trash 🗑️.
            </p>
            <div className="hidden md:flex gap-4 mb-8 text-sm text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded border border-gray-600">WASD / Arrows to Move</span>
            </div>
            <button 
              onClick={startGame}
              className="px-6 py-3 md:px-8 md:py-4 bg-primary hover:bg-indigo-600 text-white text-lg md:text-xl font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(108,92,231,0.5)]"
            >
              START MISSION
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md text-center p-4">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">GAME OVER</h2>
            <div className="text-2xl md:text-3xl font-mono text-yellow-300 mb-4">SCORE: {score}</div>
            
            <div className="bg-black/40 p-4 rounded-lg max-w-xs md:max-w-lg mb-6 border border-white/10 mx-4">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mission Debrief (AI)</h3>
              {loadingBriefing ? (
                 <div className="animate-pulse text-gray-300 text-sm">Decryption incoming...</div>
              ) : (
                <p className="text-base md:text-lg italic text-pink-200">"{briefing}"</p>
              )}
            </div>

            <button 
              onClick={startGame}
              className="flex items-center px-6 py-3 bg-white text-red-900 text-lg font-bold rounded-full transition-all hover:bg-gray-200 hover:scale-105"
            >
              <RefreshCw className="mr-2" /> REPLAY
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 lg:hidden w-full max-w-[200px]">
         <div></div>
         <button 
           className="bg-gray-800 active:bg-primary p-4 rounded-lg flex justify-center items-center touch-manipulation"
           onPointerDown={() => handleTouchStart('ArrowUp')}
           onPointerUp={() => handleTouchEnd('ArrowUp')}
           onPointerLeave={() => handleTouchEnd('ArrowUp')}
         >
           <ChevronUp />
         </button>
         <div></div>
         
         <button 
           className="bg-gray-800 active:bg-primary p-4 rounded-lg flex justify-center items-center touch-manipulation"
           onPointerDown={() => handleTouchStart('ArrowLeft')}
           onPointerUp={() => handleTouchEnd('ArrowLeft')}
           onPointerLeave={() => handleTouchEnd('ArrowLeft')}
         >
           <ChevronLeft />
         </button>
         
         <button 
           className="bg-gray-800 active:bg-primary p-4 rounded-lg flex justify-center items-center touch-manipulation"
           onPointerDown={() => handleTouchStart('ArrowDown')}
           onPointerUp={() => handleTouchEnd('ArrowDown')}
           onPointerLeave={() => handleTouchEnd('ArrowDown')}
         >
           <ChevronDown />
         </button>

         <button 
           className="bg-gray-800 active:bg-primary p-4 rounded-lg flex justify-center items-center touch-manipulation"
           onPointerDown={() => handleTouchStart('ArrowRight')}
           onPointerUp={() => handleTouchEnd('ArrowRight')}
           onPointerLeave={() => handleTouchEnd('ArrowRight')}
         >
           <ChevronRight />
         </button>
      </div>
      
      <div className="mt-4 text-gray-500 text-xs text-center lg:block hidden">
        Desktop: Use Arrows or WASD to move.
      </div>
    </div>
  );
};

export default SpaceDonutPatrol;