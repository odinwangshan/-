import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Timer, RotateCcw, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface CardItem {
  id: string;
  pairId: number;
  type: 'name' | 'desc';
  category: string;
  content: string;
  icon: string;
  color: string;
}

interface Match {
  leftId: string;
  rightId: string;
  pairId: number;
  color: string;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const RAW_CARDS: CardItem[] = [
  // --- 火成岩家族 (Igneous) ---
  { id: '1-name', pairId: 1, type: 'name', category: 'igneous', content: '花崗岩', icon: '🪨', color: 'bg-red-50 border-red-200' },
  { id: '1-desc', pairId: 1, type: 'desc', category: 'igneous', content: '【深成岩】岩漿在地底「緩慢」冷卻，花紋美麗，結晶顆粒大', icon: '⏳', color: 'bg-red-50' },
  
  { id: '2-name', pairId: 2, type: 'name', category: 'igneous', content: '玄武岩', icon: '🌋', color: 'bg-gray-800 text-white border-gray-600' },
  { id: '2-desc', pairId: 2, type: 'desc', category: 'igneous', content: '【火山岩】岩漿噴發「快速」冷卻，氣孔多、結晶小 (澎湖常見)', icon: '💨', color: 'bg-gray-100' },

  { id: '7-name', pairId: 7, type: 'name', category: 'igneous', content: '安山岩', icon: '⛰️', color: 'bg-stone-600 text-white border-stone-400' },
  { id: '7-desc', pairId: 7, type: 'desc', category: 'igneous', content: '【火山岩】顏色像斑馬(斑狀組織)，是台灣最常見的火山岩 (陽明山)', icon: '🦓', color: 'bg-stone-100' },
  
  // --- 沉積岩家族 (Sedimentary) ---
  { id: '4-name', pairId: 4, type: 'name', category: 'sedimentary', content: '砂岩', icon: '🏖️', color: 'bg-yellow-100 border-yellow-200' },
  { id: '4-desc', pairId: 4, type: 'desc', category: 'sedimentary', content: '【碎屑沉積】沙粒堆積膠結而成，摸起來像砂紙一樣粗糙', icon: '🖐️', color: 'bg-yellow-50' },
  
  { id: '6-name', pairId: 6, type: 'name', category: 'sedimentary', content: '石灰岩', icon: '🐚', color: 'bg-sky-100 border-sky-200' },
  { id: '6-desc', pairId: 6, type: 'desc', category: 'sedimentary', content: '【生物沉積】古代海洋生物(珊瑚)堆積而成，常含有化石', icon: '🦴', color: 'bg-sky-50' },

  { id: '8-name', pairId: 8, type: 'name', category: 'sedimentary', content: '礫岩', icon: '🥔', color: 'bg-orange-100 border-orange-200' },
  { id: '8-desc', pairId: 8, type: 'desc', category: 'sedimentary', content: '【碎屑沉積】像天然的混凝土，由許多鵝卵石膠結在一起 (火炎山)', icon: '🧱', color: 'bg-orange-50' },

  // --- 變質岩家族 (Metamorphic) ---
  { id: '3-name', pairId: 3, type: 'name', category: 'metamorphic', content: '大理岩', icon: '🏛️', color: 'bg-white border-2 border-purple-200' },
  { id: '3-desc', pairId: 3, type: 'desc', category: 'metamorphic', content: '由石灰岩「變質」而來，主要成分是方解石，遇鹽酸會冒泡', icon: '🧪', color: 'bg-purple-50' },
  
  { id: '5-name', pairId: 5, type: 'name', category: 'metamorphic', content: '板岩', icon: '🏚️', color: 'bg-slate-600 text-white border-slate-400' },
  { id: '5-desc', pairId: 5, type: 'desc', category: 'metamorphic', content: '由頁岩「變質」而成，可以劈成一片一片，原住民拿來蓋石板屋', icon: '🏠', color: 'bg-slate-100' },

  { id: '9-name', pairId: 9, type: 'name', category: 'metamorphic', content: '片岩', icon: '🎋', color: 'bg-green-100 border-green-200' },
  { id: '9-desc', pairId: 9, type: 'desc', category: 'metamorphic', content: '受強力擠壓，礦物排列成一層一層的「片理」，像千層派一樣', icon: '🍰', color: 'bg-green-50' },

  { id: '10-name', pairId: 10, type: 'name', category: 'metamorphic', content: '片麻岩', icon: '🦓', color: 'bg-gray-200 border-gray-300' },
  { id: '10-desc', pairId: 10, type: 'desc', category: 'metamorphic', content: '變質程度最高，有黑白相間的粗條紋，是台灣「最古老」的岩石', icon: '👴', color: 'bg-gray-50' },
];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const GeologyMaster: React.FC = () => {
  const [leftItems, setLeftItems] = useState<CardItem[]>([]);
  const [rightItems, setRightItems] = useState<CardItem[]>([]);
  const [selected, setSelected] = useState<{id: string, side: 'left' | 'right', pairId: number} | null>(null); 
  const [matches, setMatches] = useState<Match[]>([]); 
  const [wrongSelection, setWrongSelection] = useState<string | null>(null); 
  
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // SVG Line Drawing
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !gameFinished) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameFinished]);

  // Start Game Automatically on Mount
  useEffect(() => {
    startGame();
  }, []);

  // Update Lines on Match or Resize
  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = matches.map(match => {
      const el1 = document.getElementById(`card-${match.leftId}`);
      const el2 = document.getElementById(`card-${match.rightId}`);
      
      if (!el1 || !el2) return null;

      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();

      return {
        x1: rect1.right - containerRect.left, 
        y1: rect1.top + rect1.height / 2 - containerRect.top,
        x2: rect2.left - containerRect.left, 
        y2: rect2.top + rect2.height / 2 - containerRect.top,
        color: match.color 
      };
    }).filter((l): l is Line => l !== null);
    setLines(newLines);
  };

  useLayoutEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matches, leftItems]); 

  const startGame = () => {
    const names = shuffle(RAW_CARDS.filter(c => c.type === 'name'));
    const descs = shuffle(RAW_CARDS.filter(c => c.type === 'desc'));
    setLeftItems(names);
    setRightItems(descs);
    
    setSelected(null);
    setMatches([]);
    setMoves(0);
    setTimer(0);
    setIsPlaying(true);
    setGameFinished(false);
  };

  const handleItemClick = (item: CardItem, side: 'left' | 'right') => {
    if (gameFinished) return;
    
    // Check if already matched
    const isMatched = matches.some(m => m.leftId === item.id || m.rightId === item.id);
    if (isMatched) return;

    if (!selected) {
      // First selection
      setSelected({ id: item.id, side, pairId: item.pairId });
    } else {
      // Second selection
      if (selected.id === item.id) {
        // Deselect if clicking same item
        setSelected(null);
        return;
      }

      if (selected.side === side) {
        // Change selection if clicking same side
        setSelected({ id: item.id, side, pairId: item.pairId });
        return;
      }

      // Check match
      setMoves(m => m + 1);
      if (selected.pairId === item.pairId) {
        // Match found!
        const newMatch: Match = {
          leftId: side === 'left' ? item.id : selected.id,
          rightId: side === 'right' ? item.id : selected.id,
          pairId: item.pairId,
          color: 'text-green-500 stroke-green-500' 
        };
        const newMatches = [...matches, newMatch];
        setMatches(newMatches);
        setSelected(null);

        // Check Win
        if (newMatches.length === RAW_CARDS.length / 2) {
          handleWin();
        }
      } else {
        // Wrong match
        setWrongSelection(item.id);
        setTimeout(() => setWrongSelection(null), 500);
        setSelected(null);
      }
    }
  };

  const handleWin = async () => {
    setGameFinished(true);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center font-sans">
      {/* HUD / Header */}
      <div className="w-full max-w-5xl flex flex-wrap justify-between items-center text-white mb-6 gap-4">
        <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
               <ArrowLeft className="w-6 h-6 mr-1" /> Back
            </Link>
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-slate-100">地質大師挑戰賽</h1>
        </div>

        <div className="flex gap-4 md:gap-6 ml-auto">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-lg">
            <Timer size={18} className="text-yellow-400" />
            <span className="font-mono text-xl">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-lg">
            <RotateCcw size={18} className="text-blue-400" />
            <span className="font-mono text-xl">{moves} 步</span>
          </div>
        </div>

        <button 
          onClick={startGame} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700 text-sm md:text-base ml-2 shadow-lg"
        >
            <RefreshCw size={16} /> <span className="hidden md:inline">重新開始</span>
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 w-full max-w-5xl relative flex gap-4 md:gap-16 justify-between overflow-hidden" ref={containerRef}>
        
        {/* SVG Overlay for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map((line, i) => (
            <line 
              key={i}
              x1={line.x1} 
              y1={line.y1} 
              x2={line.x2} 
              y2={line.y2} 
              stroke="#22c55e" 
              strokeWidth="4" 
              strokeLinecap="round"
              className="opacity-60 drop-shadow-[0_0_3px_rgba(34,197,94,0.8)]"
            />
          ))}
        </svg>

        {/* Left Column (Names) */}
        <div className="w-1/3 flex flex-col gap-3 z-20 overflow-y-auto pr-1 pb-20 custom-scrollbar">
          {leftItems.map((item) => {
            const isSelected = selected?.id === item.id;
            const isMatched = matches.some(m => m.leftId === item.id);
            const isWrong = wrongSelection === item.id;

            return (
              <div 
                id={`card-${item.id}`}
                key={item.id}
                onClick={() => handleItemClick(item, 'left')}
                className={`
                  p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 border-4 flex flex-col md:flex-row items-center justify-between relative
                  ${isMatched ? 'bg-slate-800 border-green-500 opacity-60' : 'bg-white hover:scale-[1.02]'}
                  ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-30' : (!isMatched && 'border-white')}
                  ${isWrong ? 'animate-pulse border-red-500 bg-red-50' : ''}
                `}
              >
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
                    <span className="text-2xl md:text-3xl filter drop-shadow-md">{item.icon}</span>
                    <span className={`font-bold text-sm md:text-xl ${isMatched ? 'text-green-500' : 'text-slate-800'}`}>
                      {item.content}
                    </span>
                  </div>
                  {isMatched && <CheckCircle size={24} className="text-green-500 absolute top-2 right-2 md:static" />}
              </div>
            );
          })}
        </div>

        {/* Right Column (Descriptions) */}
        <div className="w-2/3 flex flex-col gap-3 z-20 overflow-y-auto pr-1 pb-20 custom-scrollbar">
          {rightItems.map((item) => {
            const isSelected = selected?.id === item.id;
            const isMatched = matches.some(m => m.rightId === item.id);
            const isWrong = wrongSelection === item.id;

            return (
              <div 
                id={`card-${item.id}`}
                key={item.id}
                onClick={() => handleItemClick(item, 'right')}
                className={`
                  p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 border-4 flex items-center gap-3
                  ${isMatched ? 'bg-slate-800 border-green-500 opacity-60' : 'bg-white hover:scale-[1.02]'}
                  ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-30' : (!isMatched && 'border-white')}
                  ${isWrong ? 'animate-pulse border-red-500 bg-red-50' : ''}
                `}
              >
                  <div className="text-2xl min-w-[30px] hidden md:block">{item.icon}</div>
                  <div className={`text-xs md:text-base leading-snug font-medium ${isMatched ? 'text-green-500' : 'text-slate-600'}`}>
                    {item.content}
                  </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Win Modal */}
      {gameFinished && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl">
            <Trophy size={64} className="text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">配對成功！</h2>
            <p className="text-slate-500 mb-6">所有岩石都找到家了！</p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 uppercase">時間</div>
                <div className="text-xl font-mono font-bold text-slate-800">{formatTime(timer)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase">步數</div>
                <div className="text-xl font-mono font-bold text-slate-800">{moves}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={startGame} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg">再玩一次</button>
              <Link to="/" className="block w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                回到大廳
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeologyMaster;