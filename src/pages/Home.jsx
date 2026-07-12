import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiLoader,
  FiAlertCircle,
  FiPlayCircle,
} from "react-icons/fi";

import { getPlaylistVideos } from "../services/youtubeService";
import { useDebounce } from "../hooks/useDebounce";
import { VideoCard } from "../components/VideoCard";

export const Home = ({ searchQuery }) => {
  const PLAYLIST_ID = import.meta.env.VITE_PLAYLIST_ID;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextPageToken, setNextPageToken] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const observerTarget = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchVideos = async (token = "") => {
    try {
      const data = await getPlaylistVideos(
        PLAYLIST_ID,
        token
      );

      if (token) {
        setVideos((prev) => [...prev, ...data.items]);
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
    fetchVideos();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          nextPageToken &&
          !isFetchingMore
        ) {
          setIsFetchingMore(true);
          fetchVideos(nextPageToken);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (observerTarget.current)
      observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [nextPageToken, isFetchingMore]);

  const filteredVideos = videos.filter((video) => {
    return (
      video.snippet.title
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      video.snippet.description
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    );
  });

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">

        <FiLoader className="animate-spin text-5xl text-red-600" />

      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">

        <FiAlertCircle className="text-6xl text-red-500 mb-5" />

        <h2 className="text-3xl font-bold">

          Failed to load playlist

        </h2>

        <p className="text-slate-500 mt-2">

          {error}

        </p>

      </div>
    );

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

      {/* Header */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10"
      >

        <div className="flex items-center gap-3">

          <FiPlayCircle className="text-red-600 text-4xl" />

          <div>

            <p className="text-slate-500 mt-1">

              {videos.length} Videos Available

            </p>

          </div>

        </div>

      </motion.div>

      {/* Grid */}

      {filteredVideos.length === 0 ? (
        <div className="py-20 text-center">

          <h2 className="text-2xl font-semibold">

            No videos found

          </h2>

          <p className="text-slate-500 mt-2">

            Try searching another keyword.

          </p>

        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
        >

          {filteredVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
            />
          ))}

        </motion.div>
      )}

      {/* Infinite Scroll */}

      <div
        ref={observerTarget}
        className="h-20 flex justify-center items-center"
      >

        {isFetchingMore && (
          <FiLoader className="animate-spin text-4xl text-red-600" />
        )}

      </div>

    </main>
  );
};