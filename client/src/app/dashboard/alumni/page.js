"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic2, Briefcase, LogOut, Plus, X, Heart, MessageSquare,
  Trash2, ChevronRight, Building2, Tag, ExternalLink, Send,
  Users, BookOpen, Trophy, Sparkles, CheckCircle2
} from "lucide-react";
import { alumniAPI, userAPI, placementAPI } from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RoleBadge({ role, placementRole }) {
  const isAlumni = role === "alumni";
  const isSenior = placementRole === "senior";
  if (isAlumni) return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">Alumni</span>;
  if (isSenior) return <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">Senior</span>;
  return null;
}

// ─── Post Card ───────────────────────────────────────────────────
function TalkCard({ talk, currentUser, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLiked = currentUser && talk.likes?.some(id => id === currentUser._id || id?._id === currentUser._id || id?.toString() === currentUser._id);
  const isAuthor = currentUser && talk.author?._id === currentUser._id;
  const isTedTalk = talk.type === "tedtalk";

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(talk._id, commentText);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Top accent stripe */}
      <div className={`h-1 ${isTedTalk ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${isTedTalk ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
              {talk.author?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{talk.author?.name || "Unknown"}</span>
                <RoleBadge role={talk.author?.role} placementRole={talk.author?.placementRole} />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{talk.author?.department}</span>
                <span>·</span>
                <span>{timeAgo(talk.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Type pill */}
            <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isTedTalk ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
              {isTedTalk ? <><Mic2 className="w-3 h-3" /> TED Talk</> : <><Building2 className="w-3 h-3" /> Tech Update</>}
            </span>
            {/* Status Badge */}
            {talk.status && talk.status !== "approved" && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${talk.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                {talk.status}
              </span>
            )}
            {/* Delete */}
            {isAuthor && (
              <button onClick={() => onDelete(talk._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Company tag for tech updates */}
        {!isTedTalk && talk.company && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl mb-3 w-fit border border-amber-100">
            <Building2 className="w-3.5 h-3.5" /> {talk.company}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight">{talk.title}</h3>

        {/* Body */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 mb-4">{talk.body}</p>

        {/* Session details */}
        {talk.sessionLink && talk.dateTime && (
          <div className="flex flex-col gap-2 mb-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">📅 Scheduled For: {new Date(talk.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <a href={talk.sessionLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 w-fit group bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all">
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" /> Join Live Session
            </a>
          </div>
        )}

        {/* Tags */}
        {talk.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {talk.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <button
            onClick={() => onLike(talk._id)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
            <span>{talk.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{talk.comments?.length || 0}</span>
          </button>
        </div>

        {/* Comments drawer */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1">
              {talk.comments?.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>
              )}
              {talk.comments?.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-bold text-slate-700">{c.user?.name || "User"}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={submitting}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────
function PostModal({ type, onClose, onSubmit, isAlumni }) {
  const isTedTalk = type === "tedtalk";
  const [form, setForm] = useState({ title: "", body: "", company: "", sessionLink: "", dateTime: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: form.title,
      body: form.body,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      ...(isTedTalk ? { sessionLink: form.sessionLink, dateTime: form.dateTime } : { company: form.company })
    };
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center relative overflow-hidden ${isTedTalk ? "bg-gradient-to-r from-purple-700 to-pink-600" : "bg-gradient-to-r from-amber-600 to-orange-500"}`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {isTedTalk ? <><Mic2 className="w-5 h-5" /> Post a TED Talk</> : <><Building2 className="w-5 h-5" /> Share Tech Update</>}
            </h2>
            <p className="text-white/70 text-xs mt-1">
              {isTedTalk ? "Share your industry insights and experience" : "Share your company's recent tech news"}
            </p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50">
          {!isTedTalk && (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Company Name</label>
              <input required type="text" value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Google, Microsoft, Flipkart"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium" />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Title</label>
            <input required type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder={isTedTalk ? "e.g. How I cracked Google SWE in 3 months" : "e.g. Google I/O 2025 – Key Highlights"}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              {isTedTalk ? "Your Story / Insights" : "Details"}
            </label>
            <textarea required rows={5} value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              placeholder={isTedTalk ? "Share your experience, tips, and lessons learned..." : "Describe the tech update, what changed, why it matters..."}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium resize-none" />
          </div>

          {isTedTalk && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Date & Time</label>
                <input required type="datetime-local" value={form.dateTime}
                  onChange={e => setForm({ ...form, dateTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Session Link</label>
                <input required type="url" value={form.sessionLink}
                  onChange={e => setForm({ ...form, sessionLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Tags <span className="text-slate-400 normal-case font-normal">(comma separated)</span></label>
            <input type="text" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. DSA, System Design, React"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-50 ${isTedTalk ? "bg-purple-600 hover:bg-purple-700" : "bg-amber-500 hover:bg-amber-600"}`}>
              {submitting ? "Posting..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Alumni Dashboard ────────────────────────────────────────
export default function AlumniDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [placementRole, setPlacementRole] = useState("");
  const [isTpcCoord, setIsTpcCoord] = useState(false);
  const [isHOD, setIsHOD] = useState(false);

  const [talks, setTalks] = useState([]);
  const [pendingTalks, setPendingTalks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const feedRef = useRef(null);

  const isAlumni = user?.role === "alumni" || placementRole === "alumni";
  const isSenior = placementRole === "senior";
  const canPost = isAlumni || isSenior;

  // Auth check and load data
  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) { router.push("/"); return; }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      setLoading(true);
      try {
        const [roleRes, talksRes] = await Promise.all([
          placementAPI.getPlacementRole(),
          alumniAPI.getAllTalks()
        ]);

        const rData = roleRes.data?.data;
        setPlacementRole(rData?.placementRole || "");

        const isTpc = rData?.isTpcCoord || false;
        const hod = rData?.isHOD || false;

        setIsTpcCoord(isTpc);
        setIsHOD(hod);

        setTalks(talksRes.data?.data || []);

        if (isTpc || hod) {
          const pendingRes = await alumniAPI.getPendingTalks();
          setPendingTalks(pendingRes.data?.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const fetchTalks = async () => {
    try {
      const res = await alumniAPI.getAllTalks();
      setTalks(res.data?.data || []);
      if (isTpcCoord || isHOD) {
        const pRes = await alumniAPI.getPendingTalks();
        setPendingTalks(pRes.data?.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleLike = async (id) => {
    try {
      await alumniAPI.toggleLike(id);
      fetchTalks(); // simple refresh; could optimise with local state
    } catch (err) { console.error(err); }
  };

  const handleComment = async (id, text) => {
    try {
      await alumniAPI.addComment(id, text);
      fetchTalks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await alumniAPI.deleteTalk(id);
      fetchTalks();
    } catch (err) { alert("Failed to delete post."); }
  };

  const handlePost = async (payload) => {
    try {
      if (modal === "tedtalk") await alumniAPI.createTedTalk(payload);
      else await alumniAPI.createTechUpdate(payload);
      setModal(null);
      fetchTalks();
      feedRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      alert("Failed to post. Check your permissions.");
    }
  };

  const handleLogout = () => {
    ["token", "user", "role", "placementRole"].forEach(k => localStorage.removeItem(k));
    router.push("/");
  };

  const handleReview = async (id, status) => {
    try {
      await alumniAPI.reviewTalk(id, status);
      fetchTalks();
    } catch (err) { alert("Failed to review post."); }
  };

  const filtered = talks.filter(t => {
    if (filter !== "all" && t.type !== filter) return false;

    // Everyone sees approved posts
    if (t.status === "approved") return true;

    // Only author sees their own non-approved posts in the main feed
    const isMine = t.author?._id === user?._id || t.author === user?._id;
    return isMine;
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">

      {/* ── Navbar ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800">EduNexus</h1>
            <p className="text-[10px] text-slate-400 font-medium">Alumni & Industry Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-xs font-semibold text-purple-600">{isAlumni ? "Alumni" : isSenior ? "Senior" : "Student"}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-purple-400 font-semibold text-sm mb-1">Welcome back 👋</p>
              <h2 className="text-3xl font-extrabold text-white mb-2">{user.name}</h2>
              <p className="text-slate-400 text-sm max-w-md">
                {isAlumni
                  ? "Share your industry experience, TED-style talks, and help the next generation succeed."
                  : "Share your company's latest tech updates and insights with fellow students."}
              </p>
            </div>
            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-extrabold text-white">{talks.filter(t => t.author?._id === user._id).length}</p>
                <p className="text-xs text-slate-400 mt-0.5">Your Posts</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-extrabold text-white">{talks.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">Total Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Cards for Alumni ── */}
        {canPost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {isAlumni && (
              <button onClick={() => setModal("tedtalk")}
                className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group text-left">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
                  <Mic2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">Post a TED Talk</h4>
                  <p className="text-sm text-slate-500">Share your journey, tips, and experience</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 ml-auto transition-colors" />
              </button>
            )}

            <button onClick={() => setModal("techupdate")}
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group text-left">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Share Tech Update</h4>
                <p className="text-sm text-slate-500">Share your company&apos;s recent tech news</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 ml-auto transition-colors" />
            </button>
          </div>
        )}

        {/* ── Feed ── */}
        <div ref={feedRef}>
          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { key: "all", label: "All Posts" },
              { key: "tedtalk", label: "TED Talks" },
              { key: "techupdate", label: "Tech Updates" }
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.key ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-100 text-slate-500 hover:border-slate-200"}`}>
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-sm text-slate-400 font-medium">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* ── Pending Approvals Section for Moderators ── */}
              {(isTpcCoord || isHOD) && pendingTalks.length > 0 && (
                <div className="mb-8 bg-indigo-50/50 p-6 md:p-8 rounded-[40px] border border-indigo-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        Pending Approvals
                      </h2>
                      <p className="text-slate-500 text-sm mt-1 font-medium ml-13">Review and approve alumni submissions.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {pendingTalks.map((talk) => (
                      <div key={talk._id} className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {talk.type === 'tedtalk' ? 'TED Talk' : 'Tech Update'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Posted by {talk.author?.name}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{talk.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-1 italic">"{talk.body.substring(0, 100)}..."</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReview(talk._id, "rejected")}
                            className="px-6 py-2.5 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleReview(talk._id, "approved")}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                          >
                            Agree & Publish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 py-20 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic2 className="w-9 h-9 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {canPost ? "Be the first to share something with the community!" : "Check back soon for alumni insights and industry updates."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filtered.map(talk => (
                    <TalkCard
                      key={talk._id}
                      talk={talk}
                      currentUser={user}
                      onLike={handleLike}
                      onComment={handleComment}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Post Modal ── */}
      {modal && (
        <PostModal
          type={modal}
          isAlumni={isAlumni}
          onClose={() => setModal(null)}
          onSubmit={handlePost}
        />
      )}
    </div>
  );
}
