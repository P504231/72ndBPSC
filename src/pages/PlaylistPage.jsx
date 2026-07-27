// File: src/pages/PlaylistPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLoader, 
  FiAlertCircle, 
  FiPlayCircle, 
  FiArrowLeft, 
  FiRefreshCw,
  FiSearch,
  FiVideo,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { fetchPlaylistItems } from '../api/youtube';
import { useDebounce } from '../hooks/useDebounce';
import { VideoCard } from '../components/VideoCard';

// Skeleton loader for video cards
const VideoSkeleton = () => (
  <div className="h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
    <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
    </div>
  </div>
);

// Error state component
const ErrorState = ({ message, onRetry, onGoBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
  >
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <FiAlertCircle className="text-5xl text-red-500" />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
      Failed to Load Playlist
    </h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
      {message || 'We encountered an issue while loading this playlist. This might be due to network issues or API limits.'}
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
        >
          <FiRefreshCw className="text-lg" />
          Try Again
        </button>
      )}
      {onGoBack && (
        <button
          onClick={onGoBack}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <FiArrowLeft className="text-lg" />
          Go Back
        </button>
      )}
    </div>
  </motion.div>
);

// Empty search results
const EmptySearch = ({ query }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-20 text-center"
  >
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
      <FiSearch className="text-3xl text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
      No Videos Found
    </h2>
    <p className="text-slate-500 dark:text-slate-400">
      No results for "{query}". Try a different search term.
    </p>
  </motion.div>
);

// Empty playlist
const EmptyPlaylist = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-20 text-center"
  >
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
      <FiVideo className="text-3xl text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
      Empty Playlist
    </h2>
    <p className="text-slate-500 dark:text-slate-400">
      This playlist doesn't have any videos yet.
    </p>
  </motion.div>
);

export const PlaylistPage = ({ searchQuery = '' }) => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const playlistInfo = location.state || {};
  const playlistTitle = playlistInfo.playlistTitle || 'Playlist';
  const playlistDescription = playlistInfo.playlistDescription || '';
  const playlistThumbnail = playlistInfo.playlistThumbnail || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const observerTarget = useRef(null);
  const abortControllerRef = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchVideos = useCallback(
    async (token = '') => {
      // Cancel any previous request if still pending
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await fetchPlaylistItems(playlistId, token, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setVideos((prev) => (token ? [...prev, ...data.items] : data.items));
          setNextPageToken(data.nextPageToken);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'An error occurred while fetching videos.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [playlistId]
  );

  // Initial fetch on mount / playlist change
  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setError(null);
    setNextPageToken(null);
    fetchVideos();

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchVideos]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !isFetchingMore && !loading) {
          setIsFetchingMore(true);
          fetchVideos(nextPageToken);
        }
      },
      { threshold: 0.2 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, [nextPageToken, isFetchingMore, loading, fetchVideos]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setNextPageToken(null);
    fetchVideos();
  };

  const handleGoBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Safe filter with optional chaining to prevent crashes
  const filteredVideos = videos.filter((video) => {
    const title = video?.snippet?.title?.toLowerCase() || '';
    const description = video?.snippet?.description?.toLowerCase() || '';
    const query = debouncedSearch.toLowerCase().trim();

    return !query || title.includes(query) || description.includes(query);
  });

  // Loading state
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Back button skeleton */}
        <div className="mb-8 h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <button
          onClick={handleGoBack}
          className="group mb-8 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </button>
        <ErrorState message={error} onRetry={handleRetry} onGoBack={handleGoBack} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleGoBack}
        className="group mb-8 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
        Back to Home
      </motion.button>

      {/* Playlist Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">


          {/* Info */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
            >
              {playlistTitle}
            </motion.h1>
            
            {playlistDescription && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed"
              >
                {playlistDescription}
              </motion.p>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 mt-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-400">
                <FiVideo size={14} />
                <span>{videos.length} {videos.length === 1 ? 'Video' : 'Videos'}</span>
              </div>
              
              {debouncedSearch && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-400">
                  <FiSearch size={14} />
                  <span>Filtered: "{debouncedSearch}"</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Video Grid or Empty State */}
      <AnimatePresence mode="wait">
        {filteredVideos.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {debouncedSearch ? (
              <EmptySearch query={debouncedSearch} />
            ) : videos.length === 0 ? (
              <EmptyPlaylist />
            ) : (
              <EmptySearch query={debouncedSearch} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
          >
            {filteredVideos.map((video, index) => {
              const cardKey = video?.id?.videoId || video?.id || index;
              return <VideoCard key={cardKey} video={video} index={index} />;
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-20 flex justify-center items-center">
        {isFetchingMore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <FiLoader className="animate-spin text-red-600 text-xl" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Loading more videos...
            </span>
          </motion.div>
        )}
      </div>

      {/* End of playlist indicator */}
      {!nextPageToken && videos.length > 0 && !isFetchingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400">
            <span>You've reached the end of the playlist</span>
            <span>🎉</span>
          </div>
        </motion.div>
      )}
    </main>
  );
};