import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiEye } from "react-icons/fi";

const parseDuration = (duration = "") => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return "";

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const VideoCard = ({ video, index }) => {
  const { id, snippet, statistics, contentDetails } = video;

  const thumbnail =
    snippet?.thumbnails?.maxres?.url ||
    snippet?.thumbnails?.standard?.url ||
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={`/watch/${id}`}
        state={{ video }}
        className="block overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Thumbnail */}

        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={snippet?.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Gradient */}

          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Duration */}

          <div className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <div className="flex items-center gap-1">
              <FiClock size={12} />
              {parseDuration(contentDetails?.duration)}
            </div>
          </div>
        </div>

        {/* Content */}

        <div className="p-4">

          {/* Title */}

          <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white line-clamp-2">
            {snippet?.title || "Untitled Video"}
          </h3>

          {/* Channel */}

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {snippet?.channelTitle}
          </p>

          {/* Stats */}

          <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">

            <span className="flex items-center gap-1">
              <FiEye size={14} />
              {Number(statistics?.viewCount || 0).toLocaleString()}
            </span>

            <span className="mx-3">•</span>

            <span>
              {new Date(snippet?.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

          </div>

        </div>
      </Link>
    </motion.div>
  );
};