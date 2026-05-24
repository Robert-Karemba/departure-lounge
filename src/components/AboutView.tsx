import React from "react";
import { ShieldCheck, Heart, Scroll, Compass } from "lucide-react";

interface AboutViewProps {
  onNavigateToSubmit: () => void;
  onNavigateToBrowse: () => void;
}

export default function AboutView({ onNavigateToSubmit, onNavigateToBrowse }: AboutViewProps) {
  const beliefs = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-golf" />,
      title: "Anonymity is freedom",
      description: "When your name isn't attached, you tell the absolute truth. We never gather your name or details. We only catalog what you lived."
    },
    {
      icon: <Heart className="h-5 w-5 text-golf" />,
      title: "Experience is shared property",
      description: "Your story doesn't end with you. Every person who discovers it carries a tiny piece of it forward into their own life passages."
    },
    {
      icon: <Scroll className="h-5 w-5 text-golf" />,
      title: "Ordinary is extraordinary",
      description: "We are not looking for fantasy heroes or shocking disasters. We look for the real—the normal Tuesday afternoon that changed everything."
    },
    {
      icon: <Compass className="h-5 w-5 text-golf" />,
      title: "The lounge connects us",
      description: "Airports are the only places where strangers sit closely side-by-side and feel, quietly, that they share a unified direction. That's what this is."
    }
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-slide-up space-y-10">
      
      {/* Editorial Header */}
      <header className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-golf block">
          Our story
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal leading-snug text-lounge-text">
          Life is a departure lounge.<br />
          <span className="font-script text-4xl block text-golf opacity-70 mt-2 lowercase leading-none select-none">
            We're all just waiting for our next flight.
          </span>
        </h2>
      </header>

      {/* Quote Container */}
      <blockquote className="border-l-2 border-golf pl-6 py-1 italic font-serif text-lg leading-relaxed text-[#e5e1d8]">
        "I was sitting in an airport terminal, watching strangers read, sigh, and board, and it hit me—we are all constantly in a departure lounge. Always between one life and the next. Always waiting. Always leaving something loved behind."
      </blockquote>

      {/* Narrative Section */}
      <section className="space-y-6 font-sans text-lounge-text-muted text-sm md:text-base leading-relaxed">
        <p>
          That exact realization was the beginning of Departure Lounge. Not a clever startup concept, not a programmatic brief—just a moment of simple clarity in a cold plastic chair under fluorescent airport terminal lights, surrounded by beautiful people who each carried an entire private universe the person seated next to them knew absolutely nothing about.
        </p>
        <p>
          The core insight that followed was simpler still: you don't have to live through everything yourself to learn from it. Every story someone else has already survived is a compass map you didn't have to draw through your own tears. Grief, courage, failure, love, deep reinvention—these are not private property. They belong to all of us the moment they are honestly voiced.
        </p>
        <p>
          So we built a sacred sanctuary for those voices. A space where anyone can step forward and deposit a tiny piece of their active experience behind—anonymously, gently, without digital clout or marketing agendas—and where another passenger can locate it and carry it safely forward.
        </p>
      </section>

      <hr className="border-white/5" />

      {/* What we believe section */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#888780] block mb-2">
            What we believe
          </span>
          <h3 className="font-serif text-2xl font-light text-lounge-text">
            Anthology Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beliefs.map((b, idx) => (
            <div 
              key={idx}
              className="bg-[#121212] border border-white/5 p-5 rounded-xl space-y-3 hover:bg-white/5 hover:border-gold-dark/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black border border-white/10 text-golf shadow-xs">
                  {b.icon}
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#e5e1d8]">
                  {b.title}
                </h4>
              </div>
              <p className="font-sans text-xs text-lounge-text-muted leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-white/5" />

      {/* Action triggers */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onNavigateToSubmit}
          className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black bg-gold rounded-lg hover:bg-golf-dark transition-colors cursor-pointer"
        >
          Leave your story here
        </button>
        <button
          onClick={onNavigateToBrowse}
          className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#c5a059] bg-transparent border border-golf/30 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          Read others
        </button>
      </div>

    </div>
  );
}
