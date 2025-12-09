import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import SpaceDonutPatrol from './pages/SpaceDonutPatrol';
import GeologyMaster from './pages/GeologyMaster';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game/donut" element={<SpaceDonutPatrol />} />
        <Route path="/game/geology" element={<GeologyMaster />} />
      </Routes>
    </HashRouter>
  );
};

export default App;