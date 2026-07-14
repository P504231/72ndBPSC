import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLoader, FiAlertCircle, FiPlayCircle, FiArrowLeft } from 'react-icons/fi';
import { fetchPlaylistItems } from '../api/youtube';
import { useDebounce } from '../hooks/useDebounce';
import { VideoCard } from '../components/VideoCard';

export const PlaylistPage = ({ searchQuery }) => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get playlist info from navigation state
  const playlistInfo = location.state || {};
  const playlistTitle = playlistInfo.playlistTitle || 'Playlist';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const observerTarget = useRef(null);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchVideos = async (token = '') => {
    try {
      const data = await fetchPlaylistItems(playlistId, token);
      if (token) {
        setVideos(prev => [...prev, ...data.items]);
      } else {
        setVideos(data.items);
      }
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setVideos([]);
    setError(null);
    setNextPageToken(null);
    fetchVideos();
  }, [playlistId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPageToken && !isFetchingMore) {
          setIsFetchingMore(true);
          fetchVideos(nextPageToken);
        }
      },
      { threshold: 0.2 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [nextPageToken, isFetchingMore, playlistId]);

  const filteredVideos = videos.filter(video =>
    video.snippet.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    video.snippet.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FiLoader className="animate-spin text-5xl text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <FiAlertCircle className="text-6xl text-red-500 mb-5" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Failed to load playlist</h2>
        <p className="text-slate-500 mt-2">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Back Button - Refined */}
      <button
        onClick={() => navigate(-1)}
        className="group mb-8 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
        Back to Home
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
        <div className="flex items-center gap-3">
          <FiPlayCircle className="text-red-600 text-4xl" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {playlistTitle}
            </h1>
            <p className="text-slate-500 mt-1">{videos.length} Videos Available</p>
          </div>
        </div>
      </motion.div>

      {filteredVideos.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">No videos found</h2>
          <p className="text-slate-500 mt-2">Try searching another keyword.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
        >
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>
      )}

      <div ref={observerTarget} className="h-20 flex justify-center items-center">
        {isFetchingMore && <FiLoader className="animate-spin text-4xl text-red-600" />}
      </div>
    </main>
  );
};