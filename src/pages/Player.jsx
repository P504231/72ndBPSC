// File: src/pages/Player.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiShare2, FiEye, FiCalendar, FiClock, FiUser,
  FiCheck, FiLoader, FiRotateCcw, FiThumbsUp, FiInfo,
} from 'react-icons/fi';

// Custom hook to manage YouTube player lifecycle
const useYouTubePlayer = (videoId, startTime = 0) => {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveCurrentTime = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.getCurrentTime !== 'function') return;
    try {
      const currentTime = Math.floor(player.getCurrentTime());
      const duration = Math.floor(player.getDuration() || 0);
      if (currentTime <= 0) return;

      const history = JSON.parse(localStorage.getItem('video_playback_history') || '{}');
      if (duration > 0 && duration - currentTime < 10) {
        delete history[videoId];
      } else {
        history[videoId] = {
          time: currentTime,
          updatedAt: new Date().toISOString(),
        };
      }
      localStorage.setItem('video_playback_history', JSON.stringify(history));
    } catch (err) {
      console.error('Error saving video time:', err);
    }
  }, [videoId]);

  useEffect(() => {
    let player;

    const initPlayer = () => {
      if (!window.YT?.Player || !videoId) return;

      player = new window.YT.Player(`youtube-player-${videoId}`, {
        events: {
          onReady: () => setIsLoading(false),
          onStateChange: (event) => {
            if (event.data === 1) {
              setIsLoading(false);
              intervalRef.current = setInterval(saveCurrentTime, 3000);
            } else {
              clearInterval(intervalRef.current);
              saveCurrentTime();
            }
          },
        },
      });
      playerRef.current = player;
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      const timer = setTimeout(initPlayer, 300);
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeunload', saveCurrentTime);

    return () => {
      clearInterval(intervalRef.current);
      saveCurrentTime();
      window.removeEventListener('beforeunload', saveCurrentTime);
      if (player?.destroy) player.destroy();
    };
  }, [videoId, saveCurrentTime]);

  return { playerRef, isLoading, saveCurrentTime };
};

export const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const video = location.state?.video;

  const getInitialStartTime = () => {
    try {
      const history = JSON.parse(localStorage.getItem('video_playback_history') || '{}');
      return history[id]?.time || 0;
    } catch {
      return 0;
    }
  };
  const startTime = getInitialStartTime();

  const { playerRef, isLoading } = useYouTubePlayer(id, startTime);

  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const handleBackNavigation = useCallback(() => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRestartVideo = useCallback(() => {
    const player = playerRef.current;
    if (player?.seekTo) {
      player.seekTo(0);
      player.playVideo();
      try {
        const history = JSON.parse(localStorage.getItem('video_playback_history') || '{}');
        delete history[id];
        localStorage.setItem('video_playback_history', JSON.stringify(history));
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  }, [playerRef, id]);

  const handleShare = useCallback(async () => {
    const currentUrl = window.location.href;
    setShareError(false);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    } catch {
      // Clipboard API failed, try fallback
    }

    // Fallback for older browsers / non-HTTPS
    const textArea = document.createElement('textarea');
    textArea.value = currentUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 3000);
    } finally {
      document.body.removeChild(textArea);
    }
  }, []);

  const viewCount = Number(video?.statistics?.viewCount || 0).toLocaleString();
  const likeCount = Number(video?.statistics?.likeCount || 0).toLocaleString();
  const publishedDate = video?.snippet?.publishedAt
    ? new Date(video.snippet.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const channelTitle = video?.snippet?.channelTitle || 'Unknown Channel';
  const videoTitle = video?.snippet?.title || 'Untitled Video';
  const description = video?.snippet?.description || '';

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackNavigation}
          className="group mb-6 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Playlist
        </motion.button>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black shadow-2xl shadow-slate-900/10 dark:shadow-black/30 ring-1 ring-white/5"
        >
          <div className="relative aspect-video">
            <iframe
              id={`youtube-player-${id}`}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1${startTime ? `&start=${startTime}` : ''}`}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-red-600/10 flex items-center justify-center backdrop-blur-sm">
                      <FiLoader className="animate-spin text-4xl text-red-500" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-red-500/20 animate-ping" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 tracking-wide">
                    Preparing your video experience...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
        </motion.div>

        {/* Video Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
        >
          {/* Title */}
          <h1 className="text-xl sm:text-xl lg:text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {videoTitle}
          </h1>

          {/* Meta Information Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Channel Info */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {channelTitle}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FiEye className="w-4 h-4" />
                {viewCount} views
              </span>
              
              {likeCount !== '0' && (
                <span className="flex items-center gap-1.5">
                  <FiThumbsUp className="w-4 h-4" />
                  {likeCount}
                </span>
              )}
              
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  {publishedDate}
                </span>
              )}
            </div>

            {/* Resume Badge */}
            {startTime > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800/50 shadow-sm">
                <FiClock className="w-3.5 h-3.5" />
                Resume at {Math.floor(startTime / 60)}:{String(startTime % 60).padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className={`inline-flex items-center gap-2.5 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/30 ${
                copied
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : shareError
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {copied ? (
                <>
                  <FiCheck className="text-green-500" />
                  Copied!
                </>
              ) : shareError ? (
                <>
                  <FiShare2 className="text-red-500" />
                  Copy Failed
                </>
              ) : (
                <>
                  <FiShare2 className="w-4 h-4" />
                  Share
                </>
              )}
            </motion.button>

            {/* Restart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestartVideo}
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <FiRotateCcw className="w-4 h-4" />
              Restart
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/50"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Video ID: {id}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {startTime > 0 ? '↻ Resuming from saved position' : '▶ Starting from beginning'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
};