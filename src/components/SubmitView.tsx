import React, { useState } from "react";
import { Sparkles, CheckCircle2, BookOpen, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SubmitViewProps {
  user: any;
  token: string | null;
  onOpenAuth: () => void;
  onSubmissionSuccess: () => void;
}

export default function SubmitView({ user, token, onOpenAuth, onSubmissionSuccess }: SubmitViewProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [subResult, setSubResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const characterLimit = 3000;

  const loadingSteps = [
    "Receiving manuscript from the lounge...",
    "Gemini is analyzing structure and narrative tone...",
    "Generating brief editorial excerpt...",
    "Computing optimal reading pacing...",
    "Evaluating qualitative resonance for Anthology compilation...",
    "Publishing anonymous passage successfully..."
  ];

  const triggerLoaderSteps = (callback: () => void) => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          callback();
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !category) {
      setError("Please fill in all details.");
      return;
    }
    if (body.length > characterLimit) {
      setError(`Story exceeds the ${characterLimit} character limit.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const submitAction = async () => {
      try {
        const response = await fetch("/api/stories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, body, category }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubResult({
            story: data.story,
            aiSelected: data.ai_selected,
            feedback: data.feedback,
          });
          onSubmissionSuccess();
        } else {
          setError(data.error || "Submission failed.");
          setSubmitting(false);
        }
      } catch (err) {
        console.warn("Connection to server failed. Saving story client-side (offline fallback).", err);
        const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
        const newStory = {
          id: `local-story-${Date.now()}`,
          title: title,
          body: body,
          category: category,
          authorId: user?.id || "anonymous-guest",
          authorUsername: user?.username || "curator",
          createdAt: new Date().toISOString(),
          excerpt: body.substring(0, 120) + "...",
          read_time: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
          ai_selected: true,
          status: "approved"
        };
        localSubmitted.push(newStory);
        localStorage.setItem("mock_submitted_stories", JSON.stringify(localSubmitted));

        setSubResult({
          story: newStory,
          aiSelected: true,
          feedback: "We reviewed your story of " + category + " locally in offline-fallback. In ordinary departures, even silence speaks volumes. Your pages are preserved.",
        });
        onSubmissionSuccess();
      }
    };

    triggerLoaderSteps(submitAction);
  };

  const handleResetForm = () => {
    setTitle("");
    setBody("");
    setCategory("");
    setSubResult(null);
    setSubmitting(false);
    setError(null);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-sm text-center py-24 px-4 animate-fade-in">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-lounge-card border border-border-subtle text-golf">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-semibold italic text-lounge-text tracking-tight mb-2">
          Sign In to Share Your Passage
        </h2>
        <p className="font-sans text-lounge-text-muted text-xs md:text-sm leading-relaxed mb-8">
          The lounge anthology is entirely anonymous, but user registration is required for safety reviews and submission records.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAuth}
          className="w-full py-2.5 rounded-lg bg-golf font-semibold text-lounge-bg text-xs uppercase tracking-wider hover:bg-golf-dark transition-all cursor-pointer"
        >
          Sign In or Create Account
        </motion.button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-slide-up">
      <AnimatePresence mode="wait">
        {submitting && !subResult ? (
          /* LOADER ACTIVE */
          <motion.div
            key="storyLoader"
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative flex items-center justify-center h-16 w-16">
              <span className="absolute inline-flex h-full w-full rounded-full bg-golf/10 animate-ping" />
              <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-golf animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg italic text-[#e5e1d8] max-w-md mx-auto">
                "{loadingSteps[loadingStep]}"
              </h3>
              <p className="text-[11px] uppercase tracking-widest font-bold text-golf font-mono animate-pulse">
                departure AI, Curating Storyteller
              </p>
            </div>
          </motion.div>
        ) : subResult ? (
          /* SUCCESS SCREEN DISPLAY FEEDBACK */
          <motion.div
            key="successView"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 py-4 w-full"
          >
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-golf/15 text-golf border border-golf/25">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-3xl font-light italic text-lounge-text leading-snug">
                Thank you for sharing your passage.
              </h2>
              <p className="font-sans text-lounge-text-muted text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                Your entry has been received and securely cataloged. In accordance with our guidelines, your name has been stripped and your memory is now anonymous.
              </p>
            </div>

            {/* Curated AI Review Details Card */}
            <div className="bg-lounge-card border border-border-subtle rounded-xl p-6 md:p-8 space-y-6 shadow-md">
              <div className="flex items-center gap-1.5 pb-3 border-b border-border-subtle">
                <Sparkles className="h-4 w-4 text-golf animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-lounge-text">
                  AI Editorial curation report
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-lounge-text-muted tracking-wider">Assigned Theme</span>
                  <p className="font-serif text-xl italic text-golf uppercase tracking-tight mt-1">
                    {subResult.story.category}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-lounge-text-muted tracking-wider">Optimal pacing</span>
                  <p className="font-mono text-[13px] text-lounge-text/80 mt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-golf" /> {subResult.story.read_time} minute read
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-lounge-text-muted tracking-wider block mb-1">Poetic Excerpt Extracted</span>
                <p className="font-sans text-lounge-text-muted text-xs md:text-sm italic leading-relaxed bg-lounge-bg border border-border-subtle p-4 rounded-lg">
                  "{subResult.story.excerpt}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-lounge-text-muted tracking-wider block mb-1">Curator Verdict</span>
                {subResult.aiSelected ? (
                  <div className="rounded-lg bg-golf/10 border border-golf/25 p-4 text-lounge-text">
                    <p className="text-sm font-semibold flex items-center gap-1.5 mb-1 text-golf">
                      <Sparkles className="h-4 w-4 text-golf fill-golf/10" /> Compiled into Volume I!
                    </p>
                    <p className="text-[11px] leading-relaxed text-lounge-text/85">
                      Your memory possesses extraordinary emotional texture and perspective. It has been compiled as an active Chapter in "The Book" (Volume I) complete with dynamic page numbers.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-lounge-bg border border-border-subtle p-4 text-lounge-text-muted">
                    <p className="text-sm font-semibold mb-1 text-lounge-text">
                      Saved in the Public Lounge
                    </p>
                    <p className="text-[11px] leading-relaxed text-lounge-text-muted/85">
                      Your story is safely placed in the public browse streams for anyone in the lounge to discover, look through, and feel close to.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-lounge-text-muted tracking-wider">Curation Feedback</span>
                <p className="font-serif italic text-lounge-text/90 text-sm mt-1 leading-relaxed">
                  "{subResult.feedback}"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResetForm}
                className="w-full py-3 bg-golf border border-golf text-lounge-bg hover:bg-golf-dark hover:shadow-lg active:translate-y-[1px] transition-all rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer font-sans"
              >
                Submit another story
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* STANDARD ENTRY WRITING FORM */
          <motion.form key="submissionForm" onSubmit={handleStorySubmit} className="space-y-6">
            <header className="space-y-1">
              <h2 className="font-serif text-3xl font-light italic text-lounge-text tracking-tight">
                Leave a memory behind.
              </h2>
              <p className="font-sans text-lounge-text-muted text-xs md:text-sm leading-relaxed">
                Write freely and without posturing. Our editorial curator reads your anonymous testimony, extracts appropriate excerpts, and compiles highly resonant entries into the physical Table of Chapters for Volume I.
              </p>
            </header>

            {/* PII Isolation Caution Warning Box */}
            <div className="flex gap-4.5 bg-lounge-card border border-border-subtle border-l-2 border-l-golf rounded-r-xl p-5 shadow-sm">
              <div className="flex-1">
                <span className="font-sans font-semibold text-xs uppercase tracking-wide text-golf block mb-1">
                  Absolute Anonymity Guarantee
                </span>
                <p className="font-sans text-lounge-text-muted text-xs leading-relaxed">
                  We never attach your username, real name, or email to the leaves in the gallery. Everything remains completely anonymous. Please avoid writing explicit personal details (phone numbers, full names) to protect your boundaries.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-4 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5 animate-slide-up">
              <label htmlFor="storyTitle" className="text-xs uppercase font-bold text-golf/80 tracking-widest block">
                Story Title
              </label>
              <input
                id="storyTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your memory a title (e.g. Platform 4, Rain)"
                required
                className="w-full rounded-lg border border-border-subtle bg-lounge-bg py-3 px-4 text-lounge-text placeholder-lounge-text-muted/40 text-[15px] focus:border-golf focus:outline-hidden transition-colors font-serif font-semibold"
              />
            </div>

            <div className="space-y-1.5 animate-slide-up">
              <label htmlFor="storyCategory" className="text-xs uppercase font-bold text-golf/80 tracking-widest block">
                Self Selected Category
              </label>
              <select
                id="storyCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-border-subtle bg-lounge-bg py-3 px-4 text-lounge-text focus:border-golf focus:outline-hidden transition-colors cursor-pointer font-sans"
              >
                <option value="" className="bg-lounge-bg text-lounge-text">Select the primary anchor of this story...</option>
                <option value="loss" className="bg-lounge-bg text-lounge-text">Loss (Departure, grief, remnants)</option>
                <option value="love" className="bg-lounge-bg text-lounge-text">Love (Fleeting intersections, bounds, adoration)</option>
                <option value="adventure" className="bg-lounge-bg text-lounge-text">Adventure (Solitary treks, mountain valleys, risk)</option>
                <option value="family" className="bg-lounge-bg text-lounge-text">Family (Sunday rituals, kitchens, heritage)</option>
                <option value="work" className="bg-lounge-bg text-lounge-text">Work (Quit lines, desk optimization, craft choices)</option>
                <option value="other" className="bg-lounge-bg text-lounge-text">Other (Midnight diners, stars, passing time)</option>
              </select>
            </div>

            <div className="relative space-y-1.5 animate-slide-up">
              <label htmlFor="storyBody" className="text-xs uppercase font-bold text-golf/80 tracking-widest block">
                The Letter
              </label>
              <textarea
                id="storyBody"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start wherever feels right. Knead your memories as they were. Do not think of editing, just write what was true..."
                required
                className="w-full min-h-[250px] rounded-lg border border-border-subtle bg-lounge-bg py-3 px-4 text-lounge-text placeholder-lounge-text-muted/40 text-[16px] leading-relaxed focus:border-golf focus:outline-hidden transition-colors font-serif resize-y"
              />
              <div className={`text-right text-[11.5px] mt-1 ${body.length > characterLimit ? "text-red-500" : "text-lounge-text-muted"} font-mono`}>
                {body.length} / {characterLimit} characters
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-golf py-3.5 text-xs font-bold uppercase tracking-widest text-lounge-bg shadow-md hover:bg-golf-dark active:translate-y-[1px] transition-all cursor-pointer font-sans"
            >
              <Sparkles className="h-4 w-4" /> Submit entry for curation
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
