import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLoader, FiAlertCircle, FiPlayCircle } from 'react-icons/fi';
import { fetchPlaylistInfo } from '../api/youtube';

export const HomePage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log(import.meta.env);
  }, []);

  useEffect(() => {
    const loadPlaylists = async () => {
      const envVars = import.meta.env;
      const ids = Object.keys(envVars)
        .filter(key => key.startsWith('VITE_PLAYLIST_ID_'))
        .sort()
        .map(key => envVars[key]);

      if (ids.length === 0) {
        setError('No playlist IDs found in environment variables.');
        setLoading(false);
        return;
      }

      try {
        const data = await Promise.all(
          ids.map(async (id) => {
            try {
              const info = await fetchPlaylistInfo(id);
              return {
                id,
                title: info.title,
                thumbnail: info.thumbnails?.medium?.url || info.thumbnails?.default?.url,
                description: info.description,
              };
            } catch (err) {
              console.error(`Failed to fetch playlist ${id}:`, err);
              return { id, title: 'Unknown Playlist', error: true };
            }
          })
        );
        setPlaylists(data);
      } catch (err) {
        setError('Failed to load playlists.');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FiLoader className="animate-spin text-5xl text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <FiAlertCircle className="text-6xl text-red-500 mb-5" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">No Playlists</h2>
        <p className="text-slate-500 mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <FiPlayCircle className="text-red-600 text-4xl" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">My Playlists</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Choose a playlist to start learning</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl, idx) => (
          <motion.div
            key={pl.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -6 }}
          >
            <Link
              to={`/playlist/${pl.id}`}
              state={{ 
                playlistTitle: pl.title,
                playlistDescription: pl.description,
                playlistThumbnail: pl.thumbnail 
              }}
              className="block overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden">
                {pl.thumbnail ? (
                  <img
                    src={pl.thumbnail}
                    alt={pl.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <FiPlayCircle className="text-slate-400 text-5xl" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white line-clamp-2">
                  {pl.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {pl.description || 'A curated collection of videos'}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
};