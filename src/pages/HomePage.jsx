// File: src/pages/HomePage.jsx
import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLoader, 
  FiAlertCircle, 
  FiPlayCircle, 
  FiBookOpen, 
  FiVideo, 
  FiChevronRight,
  FiRefreshCw,
  FiClock,
  FiMusic,
  FiHeadphones,
  FiCoffee,
  FiZap,
  FiTv // Added TV icon
} from 'react-icons/fi';
import { fetchPlaylistInfo } from '../api/youtube';

const PLAYLIST_IDS = Object.keys(import.meta.env)
  .filter((key) => key.startsWith('VITE_PLAYLIST_ID_'))
  .sort()
  .map((key) => import.meta.env[key]);

const FEATURES = [
  { icon: FiBookOpen, text: 'Study Sessions' },
  { icon: FiMusic, text: 'Focus Music' },
  { icon: FiCoffee, text: 'Chill Vibes' },
  { icon: FiZap, text: 'Mood Boosters' },
];

const SkeletonCard = memo(() => (
  <div className="h-full rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden animate-pulse shadow-sm">
    <div className="aspect-video bg-slate-200/80 dark:bg-slate-800/80" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-3/4" />
      <div className="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-1/2" />
      <div className="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-full mt-4" />
    </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-24 px-4"
  >
    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-6 shadow-inner">
      <FiBookOpen className="text-4xl text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
      No Playlists Available
    </h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base">
      Add playlist IDs to your environment variables to get started. 
      Check the documentation for setup instructions.
    </p>
  </motion.div>
);

const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
  >
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center z-10 relative">
        <FiAlertCircle className="text-5xl text-red-500" />
      </div>
      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
      Failed to Load Playlists
    </h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-base leading-relaxed">
      {message || 'An unexpected error occurred. Please try again.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
      >
        <FiRefreshCw className="text-lg" />
        Try Again
      </button>
    )}
  </motion.div>
);

const PlaylistCard = memo(({ playlist, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      delay: index * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    whileHover={{ y: -6 }}
    className="h-full"
  >
    <Link
      to={`/playlist/${playlist.id}`}
      state={{
        playlistTitle: playlist.title,
        playlistDescription: playlist.description,
        playlistThumbnail: playlist.thumbnail,
      }}
      className="group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500"
    >
      <div className="relative aspect-video overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
        {playlist.thumbnail ? (
          <>
            <img
              src={playlist.thumbnail}
              alt={playlist.title || 'Playlist Thumbnail'}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-90">
              <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-2xl">
                <FiPlayCircle className="text-white text-3xl drop-shadow-md ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <FiVideo className="text-slate-400 dark:text-slate-500 text-2xl" />
            </div>
          </div>
        )}
        
        {playlist.itemCount && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 shadow-sm">
            <FiVideo className="text-red-400" size={12} />
            {playlist.itemCount} videos
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
            {playlist.title || 'Untitled Playlist'}
          </h3>
          
          {playlist.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-medium">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <FiClock size={14} className="text-slate-400" />
            <span>Curated Picks</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <span>Listen</span>
            <FiChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
));
PlaylistCard.displayName = 'PlaylistCard';

const FeatureHighlights = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="flex flex-wrap items-center justify-center gap-3 mt-10"
  >
    {FEATURES.map((feature, idx) => (
      <div
        key={idx}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-default"
      >
        <feature.icon className="text-red-500" size={16} />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {feature.text}
        </span>
      </div>
    ))}
  </motion.div>
);

export const HomePage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlaylists = useCallback(async (signal) => {
    if (PLAYLIST_IDS.length === 0) {
      throw new Error('No playlist IDs configured. Please add VITE_PLAYLIST_ID_ variables.');
    }

    const results = await Promise.all(
      PLAYLIST_IDS.map(async (id) => {
        try {
          const info = await fetchPlaylistInfo(id);
          return {
            id,
            title: info.title,
            thumbnail: info.thumbnails?.medium?.url || info.thumbnails?.default?.url,
            description: info.description,
            error: false,
          };
        } catch (err) {
          console.error(`Failed to fetch playlist ${id}:`, err);
          return { 
            id, 
            title: 'Playlist Unavailable', 
            description: 'Failed to load this playlist',
            error: true 
          };
        }
      })
    );

    if (signal.aborted) return;
    
    const loadedPlaylists = results.filter(pl => !pl.error);
    const errorCount = results.filter(pl => pl.error).length;
    
    if (loadedPlaylists.length === 0 && errorCount > 0) {
      throw new Error('All playlists failed to load. Check your internet connection and API quota.');
    }
    
    setPlaylists(loadedPlaylists);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadPlaylists(abortController.signal);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err.message || 'Failed to load playlists.');
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    init();
    return () => abortController.abort();
  }, [loadPlaylists]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const abortController = new AbortController();
    loadPlaylists(abortController.signal)
      .catch(err => setError(err.message))
      .finally(() => {
        if (!abortController.signal.aborted) setLoading(false);
      });
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16 relative">
        <div className="text-center mb-16">
          <div className="h-12 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl w-72 mx-auto mb-5 animate-pulse" />
          <div className="h-6 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg w-56 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    );
  }

  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (playlists.length === 0) return <EmptyState />;

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/5 dark:bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/25 mb-8 border border-white/20"
        >
          <FiHeadphones className="text-white text-4xl" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
        >
          <span className="bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Study & Chill
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Your perfect companion for focused study sessions and relaxing mood boosters. 
          From productivity playlists to calming vibes — find your rhythm.
        </motion.p>
        
        <FeatureHighlights />
        
        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* New Live TV Button */}
          <a
            href="https://famelack.com/tv/il"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            <FiTv className="text-xl" />
            <span>Watch Live TV</span>
          </a>

          {/* Existing Playlists Badge */}
          <div className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-200/50 dark:border-red-800/50 text-sm font-bold text-red-700 dark:text-red-400 shadow-sm cursor-default w-full sm:w-auto">
            <FiVideo className="text-red-500" size={18} />
            <span>{playlists.length} {playlists.length === 1 ? 'Curated Playlist' : 'Curated Playlists'}</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {playlists.map((pl, idx) => (
            <PlaylistCard key={pl.id} playlist={pl} index={idx} />
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-20"
      >
        <p className="text-base font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 inline-block px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800">
          🎧 Put on your headphones and dive into your collection
        </p>
      </motion.div>

      <div className="relative mt-16">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      </div>
    </main>
  );
};