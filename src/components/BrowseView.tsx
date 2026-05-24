import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Clock, Heart, MoveRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Story, Category } from "../types";

interface BrowseViewProps {
  stories: Story[];
  loading: boolean;
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  onNavigateToSubmit: () => void;
  onNavigateToBook: () => void;
}

export default function BrowseView({
  stories,
  loading,
  selectedCategory,
  onCategoryChange,
  onNavigateToSubmit,
  onNavigateToBook,
}: BrowseViewProps) {
  const [readingStory, setReadingStory] = useState<Story | null>(null);

  const categories: { label: string; value: Category | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Loss", value: "loss" },
    { label: "Love", value: "love" },
    { label: "Adventure", value: "adventure" },
    { label: "Family", value: "family" },
    { label: "Work", value: "work" },
    { label: "Other", value: "other" },
  ];

  const getTagClass = (category: string) => {
    switch (category) {
      case "loss": return "bg-amber-950/40 text-[#c5a059] border-amber-900/40";
      case "love": return "bg-rose-950/40 text-rose-300 border-rose-900/40";
      case "adventure": return "bg-emerald-950/40 text-emerald-300 border-emerald-900/40";
      case "family": return "bg-blue-950/40 text-blue-300 border-blue-900/40";
      case "work": return "bg-indigo-950/40 text-indigo-300 border-indigo-900/40";
      default: return "bg-white/5 text-lounge-text-muted border-white/10";
    }
  };

  return (
    <div className="w-full">
      {/* Editorial Hero Block */}
      <section className="mx-auto max-w-3xl text-center py-16 px-4 animate-slide-up">
        <span className="font-script text-4xl text-golf block mb-3 leading-none">
          stories from strangers
        </span>
        <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight leading-tight mb-6 text-lounge-text">
          Every departure<br /><span className="italic opacity-60">is a beginning.</span>
        </h1>
        <p className="font-sans text-lounge-text-muted max-w-xl mx-auto leading-relaxed text-sm md:text-base mb-10">
          We are all sitting in a cosmic departure lounge, suspended between what was and what is yet to be. 
          Here, strangers leave behind their most poignant memories—curated by AI into a shared book of human passage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateToSubmit}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black bg-gold rounded-lg hover:bg-golf-dark active:translate-y-[1px] transition-all cursor-pointer"
          >
            Leave your story
          </button>
          <button
            onClick={onNavigateToBook}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-widest text-golf bg-transparent border border-golf/30 rounded-lg hover:bg-white/5 active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Read the Anthology <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Filter Category pills */}
      <section className="border-t border-white/5 pt-10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="font-serif text-2xl font-normal text-lounge-text tracking-tight">
            Leaves of Memory
          </h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`px-4 py-1.5 text-xs rounded-full border cursor-pointer font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat.value
                    ? "bg-golf text-black border-golf shadow-sm font-semibold"
                    : "bg-[#121212] border-white/5 text-lounge-text-muted hover:border-white/15 hover:text-lounge-text"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Listing */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-golf" />
            <p className="text-xs text-lounge-text-muted mt-3 font-medium">Gathering memories from the departure lounge...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl bg-white/2">
            <BookOpen className="h-8 w-8 text-lounge-text-muted mx-auto mb-3" />
            <p className="font-serif text-lg italic text-lounge-text/80">The bench is currently quiet.</p>
            <p className="text-xs text-lounge-text-muted max-w-sm mx-auto mt-1 leading-relaxed">
              No entries have been published under this category yet. Be the first to leave a shadow of your passage.
            </p>
            <button
              onClick={onNavigateToSubmit}
              className="mt-6 px-4 py-2 text-xs font-semibold text-black bg-gold rounded-md hover:bg-golf-dark transition-colors"
            >
              Write your story
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stories.map((story) => (
              <motion.article
                layout
                key={story.id}
                onClick={() => setReadingStory(story)}
                className="group relative flex flex-col justify-between bg-white/5 border border-white/10 rounded-lg p-6 hover:border-golf/45 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getTagClass(story.category)}`}>
                      {story.category}
                    </span>
                    {story.ai_selected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-golf/15 border border-golf/35 px-2 py-0.5 text-[10px] font-semibold text-golf animate-pulse">
                        <Sparkles className="h-2.5 w-2.5" /> Book Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-lounge-text-muted">
                        Anthology Entry
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight text-lounge-text mb-3 group-hover:text-golf transition-colors duration-300">
                    {story.title}
                  </h3>
                  <p className="font-sans text-xs md:text-[13px] text-lounge-text-muted leading-relaxed mb-6">
                    {story.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <span className="text-[11px] text-lounge-text-muted">
                    Anonymous · @{story.authorUsername}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-lounge-text-muted font-mono">
                    <Clock className="h-3 w-3" /> {story.read_time} min read
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      {/* Full Story Overlay Modal */}
      <AnimatePresence>
        {readingStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0c0c0c] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Top Bar Banner with Exit Button */}
              <div className="flex items-center justify-between border-b border-white/5 bg-[#050505] p-5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getTagClass(readingStory.category)}`}>
                    {readingStory.category}
                  </span>
                  {readingStory.ai_selected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-golf/15 border border-golf/20 px-2 py-0.5 text-[10px] font-semibold text-golf">
                      <Sparkles className="h-2.5 w-2.5" /> Curated chapter of Vol. I
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setReadingStory(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lounge-text-muted hover:bg-white/5 hover:text-lounge-text transition-colors cursor-pointer animate-fade-in"
                >
                  <XIcon />
                </button>
              </div>

              {/* Scrollable letter area */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 scroll-smooth">
                <div className="max-w-xl mx-auto space-y-6">
                  <header className="border-b border-white/5 pb-6 text-center">
                    <span className="font-script text-3xl text-golf block mb-1">
                      leaf from the lounge
                    </span>
                    <h2 className="font-serif text-3xl font-bold italic tracking-tight text-lounge-text leading-tight">
                      {readingStory.title}
                    </h2>
                  </header>

                  <p className="font-serif text-lounge-text/90 text-[16px] md:text-[17px] leading-relaxed whitespace-pre-line tracking-wide italic first-letter:text-4xl first-letter:font-light first-letter:font-serif first-letter:not-italic first-letter:float-left first-letter:mr-3 first-letter:text-golf">
                    {readingStory.body}
                  </p>

                  <footer className="border-t border-white/5 pt-6 flex justify-between text-xs text-lounge-text-muted font-sans">
                    <div>
                      <span>Written Anonymously</span>
                      <p className="text-[11px] text-lounge-text-muted/60 font-mono mt-0.5">Author ID: {readingStory.id}</p>
                    </div>
                    <div className="text-right">
                      <span>Posted {new Date(readingStory.createdAt).toLocaleDateString()}</span>
                      <p className="text-[11px] font-mono text-lounge-text-muted/60 mt-0.5">{readingStory.read_time} min read</p>
                    </div>
                  </footer>
                </div>
              </div>

              {/* Bottom bar advice */}
              <div className="border-t border-white/5 bg-[#05055] p-4 text-center">
                <p className="text-[11px] text-lounge-text-muted italic">
                  "Every memory left behind belongs to the people who find it." — Departure Lounge
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
