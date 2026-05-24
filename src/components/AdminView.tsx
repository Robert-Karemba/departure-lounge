import React, { useState, useEffect } from "react";
import { Sparkles, BarChart2, ShieldAlert, Heart, Calendar, Trash2, CheckCircle, AlertOctagon } from "lucide-react";
import { AdminStats, Story } from "../types";
import { DEFAULT_STORIES, DEFAULT_CHAPTERS } from "../data/staticDb";

interface AdminViewProps {
  user: any;
  token: string | null;
}

export default function AdminView({ user, token }: AdminViewProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [mySubmissions, setMySubmissions] = useState<Story[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = user && user.role === "admin";

  const loadData = async () => {
    setLoading(true);
    try {
      const headers: any = { "Authorization": `Bearer ${token}` };

      // Try loading my submissions
      const mySubResponse = await fetch(`/api/stories/contributor/${user.id}`, { headers });
      if (mySubResponse.ok) {
        const data = await mySubResponse.json();
        setMySubmissions(data);
      } else {
        throw new Error("HTTP sub error");
      }

      // Load stats if admin
      if (isAdmin) {
        const statsResponse = await fetch("/api/admin/stats", { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          throw new Error("HTTP stats error");
        }

        const allStoriesResponse = await fetch("/api/stories?category=all");
        if (allStoriesResponse.ok) {
          const allData = await allStoriesResponse.json();
          setAllSubmissions(allData);
        } else {
          throw new Error("HTTP all stories error");
        }
      }
    } catch (e) {
      console.warn("Failed to load admin logs from server, triggering local fallback dashboard...", e);
      const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
      const staticOverrides = JSON.parse(localStorage.getItem("static_story_overrides") || "{}");
      
      const myLocal = localSubmitted.filter((s: Story) => s.authorId === user?.id);
      setMySubmissions(myLocal);

      if (isAdmin) {
        // Apply overrides to static list
        const updatedStatic = DEFAULT_STORIES.map(s => {
          if (staticOverrides[s.id]) {
            return { ...s, ...staticOverrides[s.id] };
          }
          return s;
        });

        const mergedAll = [...updatedStatic, ...localSubmitted];
        setAllSubmissions(mergedAll);
        
        setStats({
          totalStories: mergedAll.length,
          pendingReview: mergedAll.filter((s: Story) => s.status === "pending").length,
          approvedChapters: DEFAULT_CHAPTERS.length + mergedAll.filter((s: Story) => s.status === "approved" && s.ai_selected).length,
          activeUsers: mergedAll.reduce((acc, current) => {
            if (current.authorId && !acc.includes(current.authorId)) {
              acc.push(current.authorId);
            }
            return acc;
          }, ["admin-id-1234"]).length
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user, token]);

  const handleUpdateStatus = async (storyId: string, status: "approved" | "rejected", aiSelected?: boolean) => {
    setUpdatingId(storyId);
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, ai_selected: aiSelected })
      });

      if (response.ok) {
        await loadData();
      } else {
        throw new Error("Curation response error");
      }
    } catch (e) {
      console.warn("Failed to update status on server. Applying curation change locally.", e);
      const localSubmitted = JSON.parse(localStorage.getItem("mock_submitted_stories") || "[]");
      const foundIdx = localSubmitted.findIndex((s: Story) => s.id === storyId);
      
      if (foundIdx !== -1) {
        localSubmitted[foundIdx].status = status;
        if (aiSelected !== undefined) {
          localSubmitted[foundIdx].ai_selected = aiSelected;
        }
        localStorage.setItem("mock_submitted_stories", JSON.stringify(localSubmitted));
      } else {
        const overrides = JSON.parse(localStorage.getItem("static_story_overrides") || "{}");
        const existingOverride = overrides[storyId] || {};
        overrides[storyId] = {
          ...existingOverride,
          status,
          ...(aiSelected !== undefined ? { ai_selected: aiSelected } : {})
        };
        localStorage.setItem("static_story_overrides", JSON.stringify(overrides));
      }
      await loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string, aiSelected?: boolean) => {
    if (aiSelected) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
          <Sparkles className="h-2.5 w-2.5" /> Curated & Book Selected
        </span>
      );
    }
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 border border-blue-100">✓ Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-800 border border-red-100">✗ Rejected / Spam</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-100">? In Review</span>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-slide-up space-y-10">
      
      <header className="pb-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-light italic text-neutral-900 tracking-tight">
            Curator Workspace
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Logged in as @{user.username} <span className="text-neutral-500">({user.role === "admin" ? "Systems Administrator" : "Contributor"})</span>
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="self-start md:self-auto px-4 py-1.5 text-xs font-semibold border border-neutral-200 rounded-lg hover:bg-neutral-50 active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          Refresh Logs
        </button>
      </header>

      {/* STATISTICS - ADMIN EYE ONLY */}
      {isAdmin && stats && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-normal text-neutral-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-neutral-500" /> Executive Curation Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 text-center">
              <span className="text-[28px] font-bold text-neutral-900 leading-none">{stats.pending_stories}</span>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-1">Pending AI Checks</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 text-center">
              <span className="text-[28px] font-bold text-neutral-900 leading-none">{stats.approved_stories}</span>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-1">Approved Leaves</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 text-center">
              <span className="text-[28px] font-bold text-emerald-800 leading-none flex items-center justify-center gap-1">
                <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" /> {stats.ai_selected_stories}
              </span>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-1">Book Volume I Chapters</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 text-center">
              <span className="text-[28px] font-bold text-red-600 leading-none">{stats.rejected_stories}</span>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-1">Flagged / Spam</p>
            </div>
          </div>
        </section>
      )}

      {/* ADMIN EDITORIAL REVIEW BOARD */}
      {isAdmin && (
        <section className="space-y-4 pt-4 border-t border-neutral-100">
          <h3 className="font-serif text-xl font-normal text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-neutral-500" /> Platform Curation Review Panel
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
            You are logged in with the owner email (<strong>karobert96@gmail.com</strong>). This board grants you complete power to adjust story visibility on the Browse page, toggle compilation into the physical Chapters Index of The Book, or moderate spam.
          </p>

          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400">Updating submissions log...</div>
          ) : allSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-neutral-50 rounded-xl text-xs text-neutral-400 italic">
              No entries logged in database to review.
            </div>
          ) : (
            <div className="border border-neutral-100 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white shadow-xs">
              {allSubmissions.map((story) => (
                <div key={story.id} className="p-5 space-y-4 hover:bg-neutral-50/25 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-neutral-900 flex items-center gap-2">
                        {story.title}
                        <span className="text-xs font-sans font-normal text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">@{story.authorUsername}</span>
                      </h4>
                      <p className="font-sans text-[11px] text-[#888780] font-semibold uppercase mt-0.5">
                        Selected Theme: {story.category} · Auth ID: {story.authorId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {getStatusBadge(story.status, story.ai_selected)}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg leading-relaxed">
                    "{story.body}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-50 pt-2 text-xs">
                    <span className="text-neutral-400 font-mono">Story ID: {story.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(story.id, "approved", !story.ai_selected)}
                        disabled={updatingId === story.id}
                        className={`px-3 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all flex items-center gap-1 ${
                          story.ai_selected
                            ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-150"
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        {story.ai_selected ? "Remove from book" : "Compile in book"}
                      </button>

                      {story.status === "approved" ? (
                        <button
                          onClick={() => handleUpdateStatus(story.id, "rejected", false)}
                          disabled={updatingId === story.id}
                          className="px-3 py-1 text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-150 rounded cursor-pointer"
                        >
                          Reject story
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(story.id, "approved", story.ai_selected)}
                          disabled={updatingId === story.id}
                          className="px-3 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-150 rounded cursor-pointer"
                        >
                          Approve story
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CONTRIBUTOR LOGS - ACCESSIBLE BY BOTH USERS & ADMINS */}
      <section className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="font-serif text-xl font-normal text-neutral-900 tracking-tight">
          Your Personal Narrative Deposits
        </h3>
        <p className="text-xs text-neutral-400">
          A historic ledger of the stories you have submitted. Green represents approved and visible in the public browse gallery. Sparkles represent selection and print in "The Book".
        </p>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading your submissions ledger...</div>
        ) : mySubmissions.length === 0 ? (
          <div className="p-8 text-center bg-neutral-50 rounded-xl text-xs text-neutral-400 italic">
            You haven't deposited any stories yet. Any stories you submit will record here.
          </div>
        ) : (
          <div className="border border-neutral-100 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white">
            {mySubmissions.map((story) => (
              <div key={story.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-neutral-900 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 max-w-lg leading-relaxed">
                    {story.excerpt}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Story ID: {story.id} · Category: {story.category} · Submitted {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="self-start sm:self-auto flex-shrink-0">
                  {getStatusBadge(story.status, story.ai_selected)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
