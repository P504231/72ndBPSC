import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMoon,
  FiSun,
  FiSearch,
  FiPlayCircle,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3 shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">

            <FiPlayCircle
              size={24}
              className="text-white"
            />

          </div>

          <div className="hidden sm:block">

            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">

              Study & Chill

            </h1>

          </div>

        </Link>

        {/* Search */}

        <div className="flex-1 max-w-2xl mx-6 hidden md:block">

          <div className="relative">

            <FiSearch
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search videos..."
              className="
              w-full
              rounded-full
              border
              border-slate-300
              dark:border-slate-700
              bg-slate-100
              dark:bg-slate-900
              py-3
              pl-12
              pr-5
              text-sm
              outline-none
              transition-all
              duration-200
              focus:border-red-500
              focus:ring-4
              focus:ring-red-500/10
              dark:text-white
              "
            />

          </div>

        </div>

        {/* Right Side */}

        <div className="flex items-center gap-3">

          <button
            onClick={toggleTheme}
            className="
            w-11
            h-11
            rounded-full
            bg-slate-100
            dark:bg-slate-900
            border
            border-slate-200
            dark:border-slate-700
            flex
            items-center
            justify-center
            transition
            hover:scale-105
            hover:border-red-500
            "
          >
            {isDark ? (
              <FiSun
                size={20}
                className="text-yellow-400"
              />
            ) : (
              <FiMoon
                size={20}
                className="text-slate-700"
              />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Search */}

      <div className="md:hidden px-4 pb-4">

        <div className="relative">

          <FiSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search..."
            className="
            w-full
            rounded-full
            border
            border-slate-300
            dark:border-slate-700
            bg-slate-100
            dark:bg-slate-900
            py-3
            pl-12
            pr-5
            text-sm
            outline-none
            focus:border-red-500
            dark:text-white
            "
          />

        </div>

      </div>

    </motion.header>
  );
};