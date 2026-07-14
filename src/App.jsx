import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { Player } from './pages/Player';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-brand-light dark:bg-brand-dark transition-colors duration-300 font-sans">
        <BrowserRouter>
          <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage searchQuery={searchQuery} />} />
            <Route path="/watch/:id" element={<Player />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;