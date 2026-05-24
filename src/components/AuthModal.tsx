import React, { useState } from "react";
import { X, Mail, Lock, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = activeTab === "login" 
      ? { email, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: activeTab === "login" ? "Welcome back to the Lounge." : "Your journal is ready. Welcome.",
          type: "success",
        });
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
          // Reset fields
          setUsername("");
          setEmail("");
          setPassword("");
          setMessage(null);
        }, 1000);
      } else {
        setMessage({ text: data.error || "Authentication failed. Please try again.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server connection failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, cubicBezier: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-100 bg-white p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Selection */}
        <div className="mb-6 flex border-b border-neutral-100">
          <button
            onClick={() => { setActiveTab("login"); setMessage(null); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "login" ? "text-neutral-900 font-semibold" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Sign In
            {activeTab === "login" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("register"); setMessage(null); }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "register" ? "text-neutral-900 font-semibold" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Create Account
            {activeTab === "register" && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h3 className="font-serif text-xl italic text-neutral-800">
              {activeTab === "login" ? "Welcome back" : "Leave your story behind"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {activeTab === "login" 
                ? "Connect to view your reflections and write new journals." 
                : "Submit entries anonymously. An account is required for security reviews."}
            </p>
          </div>

          {activeTab === "register" && (
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a pen name (Username)"
                required
                className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 py-2.5 pr-3 pl-10 text-sm placeholder-neutral-400 focus:border-neutral-700 focus:bg-white focus:outline-hidden transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 py-2.5 pr-3 pl-10 text-sm placeholder-neutral-400 focus:border-neutral-700 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
              minLength={6}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50/50 py-2.5 pr-3 pl-10 text-sm placeholder-neutral-400 focus:border-neutral-700 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>

          {message && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-md p-3 text-xs leading-relaxed border-l-2 ${
                message.type === "success" 
                  ? "bg-green-50 border-green-500 text-green-800" 
                  : "bg-red-50 border-red-500 text-red-800"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 focus:outline-hidden active:translate-y-[1px] disabled:opacity-50 transition-all font-sans cursor-pointer hover:shadow-lg hover:shadow-neutral-900/10"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : activeTab === "login" ? (
              "Sign In"
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Start Recording
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
