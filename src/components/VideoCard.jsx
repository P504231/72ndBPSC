// File: src/components/VideoCard.jsx
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiEye, FiPlay } from 'react-icons/fi';

const parseDuration = (duration = '') => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const VideoCard = memo(({ video, index }) => {
  const { id, snippet, statistics, contentDetails } = video;

  const thumbnail =
    snippet?.thumbnails?.maxres?.url ||
    snippet?.thumbnails?.standard?.url ||
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url;

  const duration = parseDuration(contentDetails?.duration);
  const viewCount = Number(statistics?.viewCount || 0).toLocaleString();
  const publishedDate = snippet?.publishedAt
    ? new Date(snippet.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.04,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        to={`/watch/${id}`}
        state={{ video }}
        className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500"
      >
        {/* Thumbnail Section */}
        <div className="relative aspect-video overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          {thumbnail ? (
            <>
              <img
                src={thumbnail}
                alt={snippet?.title || 'Video thumbnail'}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-75"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100">
                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border-2 border-white/50 shadow-2xl">
                  <FiPlay className="text-white text-2xl drop-shadow-lg ml-0.5" />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                <FiPlay className="text-slate-500 dark:text-slate-400 text-xl ml-0.5" />
              </div>
            </div>
          )}

          {/* Duration Badge */}
          {duration && (
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/85 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
              <div className="flex items-center gap-1.5">
                <FiClock size={11} />
                <span>{duration}</span>
              </div>
            </div>
          )}

          {/* View Count Badge (Top Right) */}
          {viewCount !== '0' && (
            <div className="absolute top-3 right-3 rounded-lg bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {viewCount} views
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
            {snippet?.title || 'Untitled Video'}
          </h3>
          
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            {snippet?.channelTitle || 'Unknown Channel'}
          </p>

          {/* Stats Footer */}
          <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <FiEye size={12} />
              {viewCount || '0'}
            </span>
            {publishedDate && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{publishedDate}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});