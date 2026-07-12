import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [isDark, setIsDark] = useState(() => {

    const saved = localStorage.getItem("theme");

    return saved === "dark";

  });

  useEffect(() => {

    const html = document.documentElement;

    if (isDark) {

      html.classList.add("dark");

      localStorage.setItem("theme", "dark");

    } else {

      html.classList.remove("dark");

      localStorage.setItem("theme", "light");

    }

  }, [isDark]);

  const toggleTheme = () => {

    setIsDark((prev) => !prev);

  };

  return (

    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
      }}
    >

      {children}

    </ThemeContext.Provider>

  );
};

export const useTheme = () => useContext(ThemeContext);