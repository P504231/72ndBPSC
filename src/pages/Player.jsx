import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiShare2,
  FiEye,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

export const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Video received from VideoCard
  const video = location.state?.video;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Read saved timestamp from local storage history object
  const getInitialStartTime = () => {
    try {
      const history = JSON.parse(localStorage.getItem("video_playback_history") || "{}");
      return history[id]?.time || 0;
    } catch (err) {
      return 0;
    }
  };

  const startTime = getInitialStartTime();

  useEffect(() => {
    let player;

    const saveCurrentTime = () => {
      if (player && typeof player.getCurrentTime === "function") {
        try {
          const currentTime = Math.floor(player.getCurrentTime());
          const duration = Math.floor(player.getDuration() || 0);

          if (currentTime > 0) {
            const history = JSON.parse(localStorage.getItem("video_playback_history") || "{}");
            
            // If user is inside the last 10 seconds of the video, clear the bookmark 
            // so it starts from the beginning next time
            if (duration > 0 && duration - currentTime < 10) {
              delete history[id];
            } else {
              history[id] = {
                time: currentTime,
                updatedAt: new Date().toISOString(),
              };
            }
            
            localStorage.setItem("video_playback_history", JSON.stringify(history));
          }
        } catch (err) {
          console.error("Error saving video time:", err);
        }
      }
    };

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !id) return;

      player = new window.YT.Player(`youtube-player-${id}`, {
        events: {
          onStateChange: (event) => {
            // State 1 means the video is currently playing
            if (event.data === 1) {
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

    // Load the YouTube Frame API script if it isn't already present globally
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      const timer = setTimeout(initPlayer, 300);
      return () => clearTimeout(timer);
    }

    // Capture tab closure or hard screen refreshes
    window.addEventListener("beforeunload", saveCurrentTime);

    return () => {
      clearInterval(intervalRef.current);
      saveCurrentTime();
      window.removeEventListener("beforeunload", saveCurrentTime);
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  }, [id]);

  // Enhanced share function that works on Netlify
  const handleShare = async () => {
    try {
      // Get the current URL
      const currentUrl = window.location.href;
      
      // Try using the Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setShareError(false);
        
        setTimeout(() => {
          setCopied(false);
        }, 3000);
        return;
      }
      
      // Fallback: Use the older execCommand method
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setShareError(false);
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        throw new Error('Fallback copy failed');
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Share error:', err);
      setShareError(true);
      
      // Last resort: Open native share dialog if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: video?.snippet?.title || 'Video',
            text: `Check out this video: ${video?.snippet?.title || 'Video'}`,
            url: window.location.href,
          });
          setShareError(false);
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.error('Native share error:', shareErr);
          }
        }
      }
      
      setTimeout(() => {
        setShareError(false);
      }, 3000);
    }
  };

  // Manual copy with error handling
  const handleManualCopy = () => {
    const url = window.location.href;
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setShareError(false);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } else {
        setShareError(true);
        setTimeout(() => {
          setShareError(false);
        }, 3000);
      }
    } catch (err) {
      setShareError(true);
      setTimeout(() => {
        setShareError(false);
      }, 3000);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0a0a] dark:to-[#0f0f0f]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

        {/* Back Button - Refined */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Playlist
        </button>

        {/* Video Container - Enhanced */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black shadow-2xl shadow-slate-900/20 dark:shadow-black/50">
          <div className="relative aspect-video">
            <iframe
              id={`youtube-player-${id}`}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1${
                startTime ? `&start=${startTime}` : ""
              }`}
              title={video?.snippet?.title || "YouTube Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Optional: Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Content Area - Refined */}
        <div className="mt-8 space-y-6">
          {/* Title Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              {video?.snippet?.title || "Lecture"}
            </h2>
          </div>
          
          {/* Meta Info - Enhanced */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200">
              <FiUser className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span className="font-medium">
                {video?.snippet?.channelTitle || "Unknown Channel"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <FiEye className="w-4 h-4" />
              <span>{Number(video?.statistics?.viewCount || 0).toLocaleString()} views</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <FiCalendar className="w-4 h-4" />
              <span>
                {video?.snippet?.publishedAt
                  ? new Date(video.snippet.publishedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : ""}
              </span>
            </div>

            {/* Optional: Show resume time if exists */}
            {startTime > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-200/50 dark:border-amber-800/50">
                <FiClock className="w-3.5 h-3.5" />
                <span>Resume at {Math.floor(startTime / 60)}:{String(startTime % 60).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Share Buttons - Enhanced with multiple options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Main Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md"
            >
              {copied ? (
                <>
                  <FiCheck className="text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : shareError ? (
                <>
                  <FiShare2 className="text-red-500" />
                  <span className="text-red-500">Try Again</span>
                </>
              ) : (
                <>
                  <FiShare2 />
                  Share Video
                </>
              )}
            </button>

            {/* Manual Copy Fallback (visible on error) */}
            {shareError && (
              <button
                onClick={handleManualCopy}
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
              >
                <FiShare2 />
                Copy Link Manually
              </button>
            )}
          </div>
        </div>

        {/* Description - Enhanced */}
        <div className="mt-8 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="inline-block w-1 h-6 rounded-full bg-red-500 dark:bg-red-400" />
                Description
              </h3>

              {video?.snippet?.description?.length > 180 && (
                <button
                  onClick={() =>
                    setShowFullDescription(!showFullDescription)
                  }
                  className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            <div className="relative mt-4">
              <p
                className={`text-[15px] leading-7 text-slate-600 dark:text-slate-300 ${
                  showFullDescription ? "" : "line-clamp-3"
                }`}
              >
                {video?.snippet?.description?.trim() ||
                  "No description available for this video."}
              </p>
              
              {/* Subtle fade for truncated text */}
              {!showFullDescription && video?.snippet?.description?.length > 180 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        </div>

        {/* Optional: Related or additional info */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Video ID: {id} • {startTime > 0 ? "Resuming from saved position" : "Starting from beginning"}
          </p>
        </div>

      </div>
    </motion.main>
  );
};