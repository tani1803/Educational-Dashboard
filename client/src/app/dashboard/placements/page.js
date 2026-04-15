"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI, alumniAPI } from "@/lib/api";
import { Search, Briefcase, Calendar, MapPin, Tag, Code, Trophy, Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlacementsFeed() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [techUpdates, setTechUpdates] = useState([]);
  const [pendingTalks, setPendingTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("student");
  const [isTpcCoord, setIsTpcCoord] = useState(false);
  const [isHOD, setIsHOD] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const fetchPostsAndRole = async () => {
    setLoading(true);
    try {
      const [roleRes, postsRes, alumniRes] = await Promise.all([
        placementAPI.getPlacementRole(),
        placementAPI.getPosts(searchFilter, tagFilter, yearFilter),
        alumniAPI.getAllTalks()
      ]);

      const roleData = roleRes.data?.data;
      let isTpc = false;
      if (roleData) {
        setRole(roleData.placementRole || "student");
        isTpc = roleData.isTpcCoord || false;
        setIsTpcCoord(isTpc);
        setIsHOD(roleData.isHOD || false);
      }
      setPosts(postsRes.data?.data || []);

      // Filter out only tech updates from alumni 
      const updates = (alumniRes.data?.data || []).filter(t => t.type === "techupdate");
      setTechUpdates(updates);

      // Fetch pending if TPC
      if (isTpc) {
        const pendingRes = await alumniAPI.getPendingTalks();
        setPendingTalks(pendingRes.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await alumniAPI.reviewTalk(id, status);
      // Refresh
      fetchPostsAndRole();
    } catch (err) {
      console.error(err);
      alert("Failed to review post.");
    }
  };

  useEffect(() => {
    fetchPostsAndRole();
  }, [searchFilter, tagFilter, yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFilter(searchQuery);
  };

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Placement <span className="text-indigo-600">Hub</span></h1>
          <p className="text-slate-500 mt-2 text-[15px] font-medium max-w-lg">
            Explore roadmaps, interview experiences, and mock assessments.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">
          {isTpcCoord && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
              <CheckCircle2 className="w-4 h-4" /> TPC Coordinator
            </div>
          )}

          <Link href="/dashboard/placements/contests" className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Trophy className="w-4 h-4" /> Contests
          </Link>

          <Link href="/dashboard/placements/mock-oa" className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Briefcase className="w-4 h-4" /> Mock OAs
          </Link>

          {((isTpcCoord || isHOD) || role === "alumni") && (
            <Link href="/dashboard/placements/new" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md">
              <Plus className="w-4 h-4" /> Share Experience
            </Link>
          )}
        </div>
      </div>

      {/* ROADMAPS */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Structured Roadmaps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/placements/dsa" className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all flex overflow-hidden">
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700">DSA Mastery</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Expert roadmap for master data structures and algorithms.</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Start Learning <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
              </div>
            </div>
            <div className="w-32 bg-indigo-50 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
              <Code className="w-16 h-16 text-indigo-200" />
            </div>
          </Link>

          <Link href="/dashboard/placements/development" className="group bg-white rounded-3xl border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-lg transition-all flex overflow-hidden">
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-5 shadow-sm transition-all group-hover:bg-cyan-600 group-hover:text-white">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-700">Development</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Build full-stack apps. explore React, Node, and deployment.</p>
              </div>
              <div className="flex items-center gap-2 text-cyan-600 font-bold text-sm">
                Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
              </div>
            </div>
            <div className="w-32 bg-cyan-50 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
              <Code className="w-16 h-16 text-cyan-200" />
            </div>
          </Link>
        </div>
      </div>


      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-500" /> Tech Updates <span className="text-slate-400 text-sm font-medium">from Alumni</span>
          </h2>
          <Link href="/dashboard/alumni" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            View All Updates
          </Link>
        </div>

        {techUpdates.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 text-sm font-medium">No tech updates posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techUpdates.slice(0, 3).map((update) => (
              <div key={update._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-400">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">{update.company || "General"}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(update.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-md font-bold text-slate-800 mb-2 line-clamp-1">{update.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{update.body}</p>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {update.author?.name?.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{update.author?.name} · Alumni</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* PENDING REVIEWS (TPC or HOD ONLY) */}
      {(isTpcCoord || isHOD) && pendingTalks.length > 0 && (
        <div className="mb-14 bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Pending Approvals
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium ml-13">Review and approve alumni submissions to make them visible to students.</p>
            </div>
            <span className="bg-white px-4 py-2 rounded-xl border border-indigo-100 text-indigo-600 font-bold text-sm shadow-sm">
              {pendingTalks.length} Waiting
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingTalks.map((talk) => (
              <div key={talk._id} className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {talk.type === 'tedtalk' ? 'TED Talk' : 'Tech Update'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Posted by {talk.author?.name} · {talk.author?.department}</span>
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
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
                  >
                    Agree & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Interview Database</h2>
        <span className="text-sm text-slate-400 font-medium">{posts.length} Experiences</span>
      </div>

      <div className="mb-10">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full bg-slate-50 rounded-xl relative flex items-center">
            <div className="absolute left-4"><Search className="w-4 h-4 text-slate-400" /></div>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3.5 bg-transparent border-none text-slate-800 outline-none text-sm font-medium"
              placeholder="Search company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex w-full lg:w-auto gap-2">
            <div className="relative flex-1 lg:w-48 bg-slate-50 rounded-xl flex items-center">
              <div className="absolute left-4"><Tag className="w-4 h-4 text-slate-400" /></div>
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3.5 bg-transparent border-none text-sm outline-none font-medium placeholder:text-slate-400"
                placeholder="Topic..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-50 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none text-slate-700 cursor-pointer border-none"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2024">Class 2024</option>
              <option value="2025">Class 2025</option>
              <option value="2026">Class 2026</option>
              <option value="2027">Class 2027</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-20"><div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div></div>
      ) : posts.length === 0 ? (
        <div className="bg-white py-16 rounded-3xl border border-slate-200 text-center shadow-sm">
          <Search className="w-8 h-8 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No experiences found</h3>
          <p className="text-slate-500 text-sm">Adjust filters or search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link key={post._id} href={`/dashboard/placements/${post._id}`} className="block h-full group">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col h-[260px]">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 text-slate-600 rounded-lg">{post.metadata.companyName}</span>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {post.metadata.packageCTC} LPA
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-700 line-clamp-2">{post.metadata.jobRole}</h3>
                <p className="text-xs font-semibold text-slate-400 mb-4 line-clamp-1">By {post.author?.name || 'Anonymous'}</p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Batch {post.metadata.placementYear}
                  </span>
                  <div className="flex gap-1.5 italic">
                    {post.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-bold text-slate-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
