import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, LogOut, ChevronRight, Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Story, Chapter, Category } from "./types";
import AuthModal from "./components/AuthModal";
import BrowseView from "./components/BrowseView";
import SubmitView from "./components/SubmitView";
import BookView from "./components/BookView";
import AboutView from "./components/AboutView";
import AdminView from "./components/AdminView";
import { DEFAULT_STORIES, DEFAULT_CHAPTERS } from "./data/staticDb";

export default function App() {
  const [activeTab, setActiveTab] = useState<"browse" | "submit" | "book" | "about" | "admin">("browse");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Authentication check on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const checkAuth = async () => {
        try {
          const response = await fetch("/api/auth/me", {
            headers: { "Authorization": `Bearer ${savedToken}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.warn("Auth verify API offline. Checking local storage mock database.", err);
          if (savedToken.startsWith("token-")) {
            const parts = savedToken.split("-");
            const userId = parts[1] || "";
            const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
            let found = mockUsers.find((u: any) => u.id === userId || savedToken.includes(u.id));
            if (!found && userId === "admin") {
              found = {
                id: "admin-id-1234",
                username: "curator",
                email: "karobert96@gmail.com",
                role: "admin",
                createdAt: "2026-05-24T14:55:00Z"
              };
            }
            if (found) {
              setUser(found);
              setToken(savedToken);
            } else if (savedToken.includes("admin-id-1234")) {
              setUser({
                id: "admin-id-1234",
                username: "curator",
                email: "karobert96@gmail.com",
                role: "admin",
                createdAt: "2026-05-24T14:55:00Z"
              });
              setToken(savedToken);
            } else {
              localStorage.removeItem("token");
            }
          } else {
            localStorage.removeItem("token");
          }
        }
      };
      checkAuth();
    }
  }, []);

  // Sync stories when gallery filters alter
  useEffect(() => {
    const loadStories = async () => {
      setLoadingStories(true);
      try {
        const response = await fetch(`/api/stories?category=${selectedCategory}`);
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          throw new Error("Story response status error");
        }
      } catch (err) {
        console.warn("Failed to load stories from server, falling back to static database...", err);
        const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
        const staticOverrides = JSON.parse(localStorage.getItem("static_story_overrides") || "{}");
        
        // Merge and apply overrides if they exist
        const updatedStatic = DEFAULT_STORIES.map(s => {
          if (staticOverrides[s.id]) {
            return { ...s, ...staticOverrides[s.id] };
          }
          return s;
        });

        const merged = [...updatedStatic, ...localSubmitted];
        if (selectedCategory === "all") {
          setStories(merged.filter(s => s.status === "approved"));
        } else {
          setStories(merged.filter(s => s.category === selectedCategory && s.status === "approved"));
        }
      } finally {
        setLoadingStories(false);
      }
    };
    loadStories();
  }, [selectedCategory]);

  // Sync dynamic compilation table of chapters
  const loadChapters = async () => {
    setLoadingChapters(true);
    try {
      const response = await fetch("/api/chapters/1");
      if (response.ok) {
        const data = await response.json();
        setChapters(data);
      } else {
        throw new Error("Chapters response status error");
      }
    } catch (err) {
      console.warn("Failed to load chapters from server, falling back to static chapters...", err);
      const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
      const localChapters = [...DEFAULT_CHAPTERS];
      
      localSubmitted.forEach((story: any, idx: number) => {
        const pageStart = 65 + idx * 8;
        const pageEnd = pageStart + 7;
        if (!localChapters.some(c => c.storyId === story.id)) {
          localChapters.push({
            id: `chapter-local-${story.id}`,
            title: story.title,
            category: story.category.charAt(0).toUpperCase() + story.category.slice(1),
            page_start: pageStart,
            page_end: pageEnd,
            storyId: story.id
          });
        }
      });
      setChapters(localChapters);
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    loadChapters();
  }, []);

  const handleAuthSuccess = (userData: User, userToken: string) => {
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
    setSelectedCategory("all");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setActiveTab("browse");
    setMobileMenuOpen(false);
  };

  const handleTabChange = (tab: "browse" | "submit" | "book" | "about" | "admin") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Reload database content on tab switch to ensure real-time consistency
    if (tab === "browse") {
      setSelectedCategory("all");
    } else if (tab === "book") {
      loadChapters();
    }
  };

  const handleStorySubmitted = () => {
    // Refresh chapters & public stories lists instantly
    loadChapters();
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-lounge-bg text-lounge-text font-sans flex flex-col">
      
      {/* GLOBAL AUTHENTICATION OVERLAY */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* NAVIGATION HEADER BAR */}
      <nav className="sticky top-0 z-40 w-full bg-lounge-sidebar/85 backdrop-blur-md border-b border-border-subtle select-none">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          
          {/* Logo brand click navigates home */}
          <div 
            onClick={() => handleTabChange("browse")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-golf text-lounge-bg shadow-md shadow-golf-dark/5 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <svg viewBox="0 0 22 22" className="h-5 w-5" fill="none">
                <text x="2" y="16" fontFamily="Georgia, serif" fontSize="14" fontWeight="600" fill="currentColor">D</text>
                <text x="11" y="16" fontFamily="Georgia, serif" fontSize="14" fontWeight="400" fill="var(--golf-dark)">L</text>
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold italic text-lounge-text tracking-tight leading-none group-hover:text-golf transition-colors">
                Departure Lounge
              </h1>
              <span className="text-[10px] text-lounge-text-muted font-medium tracking-widest mt-1 block uppercase">
                stories from strangers
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-lounge-card border border-border-subtle p-1.5 rounded-xl relative select-none">
            {(["browse", "submit", "book", "about"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight relative cursor-pointer z-10 transition-colors duration-300 outline-hidden ${
                    isActive
                      ? "text-lounge-bg font-bold"
                      : "text-lounge-text-muted hover:text-lounge-text"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-golf rounded-lg -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {tab === "browse" && "Browse"}
                  {tab === "submit" && "Submit a story"}
                  {tab === "book" && "The Book"}
                  {tab === "about" && "Our story"}
                </button>
              );
            })}

            {/* Admin Curation tab reveals exclusively when user is validated as admin */}
            {user && user.role === "admin" && (
              <button
                onClick={() => handleTabChange("admin")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight relative flex items-center gap-1 cursor-pointer z-10 transition-colors duration-300 outline-hidden ${
                  activeTab === "admin"
                    ? "text-lounge-bg font-bold"
                    : "text-lounge-text-muted hover:text-golf"
                }`}
              >
                {activeTab === "admin" && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-golf rounded-lg -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Sparkles className={`h-3 w-3 ${activeTab === "admin" ? "text-lounge-bg" : "text-golf"} animate-pulse`} /> Admin Workspace
              </button>
            )}
          </div>

          {/* Theme selection and User authenticate details controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Elegant Springy Theme Toggle Selector */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 12 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-1.5 rounded-lg bg-lounge-card border border-border-subtle text-golf hover:text-golf-dark transition-colors cursor-pointer flex items-center justify-center"
              title={theme === "light" ? "Switch to Midnight Dark" : "Switch to Antique Light"}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 animate-pulse" />}
            </motion.button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-lounge-text/85 font-medium bg-lounge-card border border-border-subtle px-3 py-1.5 rounded-xl">
                  @<strong>{user.username}</strong>
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border-medium rounded-lg text-lounge-text-muted hover:bg-lounge-card hover:text-lounge-text active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 text-xs font-semibold text-lounge-bg bg-golf rounded-lg hover:bg-golf-dark hover:shadow-lg active:translate-y-[1px] transition-all cursor-pointer"
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Quick Mobile burger tab / theme triggers */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-1.5 rounded-lg bg-lounge-card border border-border-subtle text-golf cursor-pointer"
            >
              {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </motion.button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-lounge-text-muted hover:bg-lounge-card cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE EXPANDED MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-lounge-sidebar border-b border-border-subtle overflow-hidden select-none"
          >
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                {(["browse", "submit", "book", "about"] as const).map((tab) => (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`w-full py-2.5 text-left text-sm font-semibold px-3 rounded-lg transition-colors cursor-pointer ${
                      activeTab === tab ? "bg-lounge-card text-golf border border-border-subtle" : "text-lounge-text-muted hover:text-lounge-text"
                    }`}
                  >
                    {tab === "browse" && "Browse Stories"}
                    {tab === "submit" && "Submit a Story"}
                    {tab === "book" && "Read The Book"}
                    {tab === "about" && "Our Story beliefs"}
                  </motion.button>
                ))}

                {user && user.role === "admin" && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTabChange("admin")}
                    className={`w-full py-2.5 text-left text-sm font-semibold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTab === "admin" ? "bg-lounge-card text-golf border border-border-subtle" : "text-lounge-text-muted hover:text-golf"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 text-golf" /> Admin Workspace
                  </motion.button>
                )}
              </div>

              <hr className="border-border-subtle" />

              <div className="pt-2">
                {user ? (
                  <div className="space-y-4">
                    <div className="text-sm font-medium px-3 py-2 text-lounge-text bg-lounge-card rounded-lg border border-border-subtle">
                      Signed in as: @<strong>{user.username}</strong>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-lg border border-border-medium text-sm font-semibold text-lounge-text-muted hover:bg-lounge-card flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                    className="w-full py-2.5 rounded-lg bg-golf hover:bg-golf-dark text-sm font-semibold text-lounge-bg shadow-md text-center cursor-pointer"
                  >
                    Sign In or Register
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE VIEWPORT CANVAS CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="w-full h-full"
          >
            {activeTab === "browse" && (
              <BrowseView
                stories={stories}
                loading={loadingStories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onNavigateToSubmit={() => handleTabChange("submit")}
                onNavigateToBook={() => handleTabChange("book")}
              />
            )}

            {activeTab === "submit" && (
              <SubmitView
                user={user}
                token={token}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSubmissionSuccess={handleStorySubmitted}
              />
            )}

            {activeTab === "book" && (
              <BookView
                chapters={chapters}
                loading={loadingChapters}
                onNavigateToSubmit={() => handleTabChange("submit")}
              />
            )}

            {activeTab === "about" && (
              <AboutView
                onNavigateToSubmit={() => handleTabChange("submit")}
                onNavigateToBrowse={() => handleTabChange("browse")}
              />
            )}

            {activeTab === "admin" && user && (
              <AdminView
                user={user}
                token={token}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER METRICS ACCENTS */}
      <footer className="w-full py-8 border-t border-border-subtle select-none">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-lounge-text-muted font-sans">
          <span>Anthology Archive · Real Stories from Strangers</span>
          <div className="flex items-center gap-6">
            <span>Volume I Edition</span>
            <span>Made with Care</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
