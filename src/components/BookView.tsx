import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, ChevronRight, ListOrdered, Calendar, ArrowUpRight } from "lucide-react";
import { Chapter, Story } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_STORIES } from "../data/staticDb";

interface BookViewProps {
  chapters: Chapter[];
  loading: boolean;
  onNavigateToSubmit: () => void;
}

export default function BookView({ chapters, loading, onNavigateToSubmit }: BookViewProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [readingStoryId, setReadingStoryId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!readingStoryId) {
      setSelectedStory(null);
      return;
    }

    const fetchStoryDetails = async () => {
      setModalLoading(true);
      try {
        const response = await fetch("/api/stories");
        if (response.ok) {
          const publicStories: Story[] = await response.json();
          const found = publicStories.find((s) => s.id === readingStoryId);
          if (found) {
            setSelectedStory(found);
            return;
          }
        }
        throw new Error("API return error");
      } catch (e) {
        console.warn("Failed to load chapter story content from API, falling back to static lookup...", e);
        const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
        const merged = [...DEFAULT_STORIES, ...localSubmitted];
        const found = merged.find((s) => s.id === readingStoryId);
        if (found) {
          setSelectedStory(found);
        } else {
          setSelectedStory(null);
        }
      } finally {
        setModalLoading(false);
      }
    };

    fetchStoryDetails();
  }, [readingStoryId]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-8">
        
        {/* Physical Hardcover Book Block */}
        <section className="lg:col-span-5 flex flex-col items-center select-none">
          <motion.div 
            whileHover={{ y: -8, rotateY: -3 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-[280px] md:w-[320px] aspect-[3/4] bg-[#141412] rounded-r-xl rounded-l-md pt-8 pb-8 pl-[38px] pr-7 text-center flex flex-col justify-between shadow-2xl relative border-l border-golf/20 overflow-hidden animate-slide-up"
            style={{ perspective: "1000px" }}
          >
            {/* Subtle spine lining shadow */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute top-0 bottom-0 left-2.5 w-[1px] bg-golf/15" />

            {/* Gold foil-like elements */}
            <div className="border border-golf/25 p-5 md:p-6 h-full flex flex-col justify-between rounded-r-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-black/60 border border-golf/20">
                <svg viewBox="0 0 28 28" className="h-8 w-8 text-gold-dark" fill="none">
                  <text x="3" y="20" fontFamily="Georgia, serif" fontSize="18" fontWeight="500" fill="#c5a059">D</text>
                  <text x="14" y="20" fontFamily="Georgia, serif" fontSize="18" fontWeight="400" fill="#8a6e3c">L</text>
                </svg>
              </div>

              <div className="space-y-2 text-center flex flex-col items-center">
                <span className="font-serif text-[10px] tracking-widest text-[#888780] font-bold uppercase block text-center w-full">
                  anthology series
                </span>
                <h2 className="font-serif text-3xl font-light tracking-widest text-gold-dark leading-tight uppercase text-center w-full">
                  Departure<br />Lounge
                </h2>
                <div className="h-[1.5px] w-12 bg-golf/20 mx-auto my-3" />
                <p className="font-serif text-xs italic text-[#888780] font-light max-w-[180px] mx-auto leading-relaxed text-center w-full">
                  an anonymous archive of passing moments and ordinary lives
                </p>
              </div>

              <div className="space-y-1 text-center flex flex-col items-center">
                <div className="font-mono text-[9px] uppercase tracking-widest text-golf/80 text-center w-full">
                  Volume I &nbsp;|&nbsp; 2026
                </div>
                <div className="text-[8px] text-[#888780]/80 text-center w-full">
                  CURATED BY AI
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-6 max-w-xs space-y-2">
            <p className="font-serif text-sm font-medium italic text-lounge-text">
              Departure Lounge Anthology — Vol I
            </p>
            <p className="font-sans text-lounge-text-muted text-xs leading-relaxed">
              Every time a story possesses exceptional resonance, it is compiled as an active chapter in our ongoing physical hardcover.
            </p>
          </div>
        </section>

        {/* Dynamic Chapter table lists */}
        <section className="lg:col-span-7 space-y-8">
          <div className="pb-4 border-b border-border-subtle flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-normal text-lounge-text tracking-tight flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-golf" /> Catalog of Chapters
              </h2>
              <p className="text-xs text-lounge-text-muted mt-0.5">
                Each page ranges from original submissions compiled in real-time.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-lounge-text-muted font-mono">
              <Calendar className="h-3.5 w-3.5 text-golf" /> May 2026 Edition
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-golf inline-block" />
              <p className="text-xs text-lounge-text-muted mt-2">Loading Table of Contents...</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 bg-lounge-card rounded-xl border border-border-subtle animate-fade-in">
              <BookOpen className="h-6 w-6 text-lounge-text-muted mx-auto mb-2" />
              <p className="font-serif text-base italic text-lounge-text/80">The pages are blank.</p>
              <p className="text-xs text-lounge-text-muted max-w-xs mx-auto mt-1 leading-relaxed">
                No story has passed the stringent emotional threshold for Volume I compilation yet. Leave your memory and let AI analyze your writing.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToSubmit}
                className="mt-4 px-4 py-1.5 text-xs font-semibold text-lounge-bg bg-golf rounded-lg hover:bg-golf-dark cursor-pointer transition-all uppercase tracking-wide font-sans shadow-md"
              >
                Write standard entry
              </motion.button>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => setReadingStoryId(ch.storyId)}
                  className="group py-4 flex items-baseline justify-between gap-6 cursor-pointer hover:bg-lounge-card px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-baseline gap-4 flex-1">
                    <span className="font-mono text-xs text-golf/30 font-bold w-6 select-none group-hover:text-golf transition-colors">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-serif text-base md:text-lg font-semibold text-lounge-text group-hover:text-golf transition-colors flex items-center gap-1.5 flex-wrap">
                        {ch.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-golf transition-opacity" />
                      </h4>
                      <span className="font-sans text-[10px] tracking-wider uppercase font-bold text-lounge-text-muted">
                        Theme: {ch.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-xs text-lounge-text-muted">
                      p. {ch.page_start}–{ch.page_end}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-6">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateToSubmit}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-lounge-bg bg-golf rounded-lg hover:bg-golf-dark transition-colors cursor-pointer"
            >
              Submit your story for consideration
            </motion.button>
          </div>
        </section>
      </div>

      {/* Chapters story detail view modal */}
      <AnimatePresence>
        {readingStoryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-lounge-bg rounded-xl shadow-2xl border border-border-medium overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border-subtle bg-lounge-sidebar p-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-golf/15 text-golf px-2.5 py-0.5 text-[10px] font-semibold border border-golf/20">
                  <Sparkles className="h-2.5 w-2.5 text-golf animate-pulse" /> Curated Collection Chapter
                </span>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setReadingStoryId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lounge-text-muted hover:bg-lounge-card hover:text-lounge-text transition-all cursor-pointer"
                >
                  <span className="text-xl">×</span>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10 scroll-smooth">
                {modalLoading ? (
                  <div className="py-20 text-center">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-golf inline-block" />
                    <p className="text-xs text-lounge-text-muted mt-2">Opening catalog pages...</p>
                  </div>
                ) : selectedStory ? (
                  <div className="max-w-xl mx-auto space-y-6">
                    <header className="border-b border-border-subtle pb-6 text-center">
                      <span className="font-script text-3xl text-golf block mb-1">
                        chapter leaf from the book
                      </span>
                      <h2 className="font-serif text-3xl font-bold italic tracking-tight text-lounge-text leading-tight">
                        {selectedStory.title}
                      </h2>
                    </header>

                    <p className="font-serif text-lounge-text/90 text-[16px] md:text-[17px] leading-relaxed whitespace-pre-line tracking-wide italic first-letter:text-4xl first-letter:font-light first-letter:font-serif first-letter:not-italic first-letter:float-left first-letter:mr-3 first-letter:text-golf">
                      {selectedStory.body}
                    </p>

                    <footer className="border-t border-border-subtle pt-6 flex justify-between text-xs text-lounge-text-muted font-sans">
                      <div>
                        <span>Anonymous Contributor</span>
                        <p className="text-[11px] text-lounge-text-muted/60 font-mono mt-0.5">Author Username: @{selectedStory.authorUsername}</p>
                      </div>
                      <div className="text-right">
                        <span>Posted {new Date(selectedStory.createdAt).toLocaleDateString()}</span>
                        <p className="text-[11px] font-mono text-lounge-text-muted/60 mt-0.5">{selectedStory.read_time} min read</p>
                      </div>
                    </footer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-lounge-text-muted">
                    <p className="font-serif italic">This chapter is currently closed for editorial review.</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border-subtle bg-lounge-sidebar p-4 text-center">
                <p className="text-[11px] text-lounge-text-muted italic">
                  Compiled under Volume I - Departure Lounge Anthology © 2026
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
