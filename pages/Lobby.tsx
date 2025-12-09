import React from 'react';
import GameCard from '../components/GameCard';

const Lobby: React.FC = () => {
  return (
    <>
      <header className="text-center py-12 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-[80px]"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black m-0 bg-gradient-to-r from-[#fab1a0] to-[#ff7675] bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] tracking-tight">
          👾 遊戲大廳
        </h1>
        <p className="text-[#b2bec3] mt-4 text-xl md:text-2xl font-light">
          選擇你的挑戰！Choose Your Challenge!
        </p>
      </header>

      <main className="flex-grow w-full flex justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          
          <GameCard
            title="甜甜圈太空巡邏隊"
            description="駕駛甜甜圈飛船，在危險的太空中收集星塵！小心別撞到垃圾！ Pilot your donut ship through the cosmos."
            icon="🍩"
            link="/game/donut"
            bgGradient="bg-gradient-to-br from-[#0b0f19] to-[#2c3e50]"
          />

          <GameCard
            title="地質大師挑戰賽"
            description="測試你對岩石的知識！將岩石名稱與特徵配對。 Test your geology knowledge by matching rocks to their descriptions!"
            icon="⛰️"
            link="/game/geology"
            isLocked={false}
            bgGradient="bg-gradient-to-br from-slate-700 to-slate-900 text-white"
          />

           <GameCard
            title="開發中專案"
            description="更多的挑戰即將來臨。 More challenges coming soon."
            icon="🚧"
            isLocked={true}
             bgGradient="bg-[repeating-linear-gradient(45deg,#606060,#606060_10px,#505050_10px,#505050_20px)] text-gray-400"
          />
        </div>
      </main>

      <footer className="p-8 text-center text-[#636e72] text-sm">
        <p>© 2025 小小工程師遊戲工作室 | Mini Engineer Game Studio</p>
        <p className="mt-2 text-xs opacity-50">Powered by React & Gemini</p>
      </footer>
    </>
  );
};

export default Lobby;