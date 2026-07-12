import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiShare2,
  FiEye,
  FiCalendar,
} from "react-icons/fi";
import { useState } from "react";

export const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Video received from VideoCard
  const video = location.state?.video;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copied, setCopied] = useState(false);

  // const handleShare = async () => {
  //   try {
  //     await navigator.clipboard.writeText(window.location.href);
  //     setCopied(true);

  //     setTimeout(() => {
  //       setCopied(false);
  //     }, 2000);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f]"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Back Button */}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition"
        >
          <FiArrowLeft />
          Back to Playlist
        </button>

        {/* Video */}

        <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">

          <div className="relative aspect-video">

            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
              title={video?.snippet?.title || "YouTube Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

          </div>

        </div>

        {/* Title */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold leading-7 tracking-tight text-slate-900 dark:text-white">
               {video?.snippet?.title || "Lecture"}
          </h2>
          {/* Meta */}

          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400">

            <span className="font-medium text-slate-700 dark:text-slate-200">
              {video?.snippet?.channelTitle || "Unknown Channel"}
            </span>

            <span className="flex items-center gap-1">
              <FiEye />
              {Number(video?.statistics?.viewCount || 0).toLocaleString()} views
            </span>

            <span className="flex items-center gap-1">
              <FiCalendar />
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

          {/* Share */}
{/* 
          <button
            onClick={handleShare}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FiShare2 />
            {copied ? "Copied!" : "Share"}
          </button> */}

        </div>

        {/* Description */}

        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

          <div className="p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Description
              </h2>

              {video?.snippet?.description?.length > 180 && (
                <button
                  onClick={() =>
                    setShowFullDescription(!showFullDescription)
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}

            </div>

            <p
              className={`mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-600 dark:text-slate-300 ${
                showFullDescription ? "" : "line-clamp-2"
              }`}
            >
              {video?.snippet?.description?.trim() ||
                "No description available for this video."}
            </p>

          </div>

        </div>

      </div>
    </motion.main>
  );
};