"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI } from "@/lib/api";
import { Search, Briefcase, ExternalLink, Calendar, MapPin, Tag, Code } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlacementsFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [role, setRole] = useState("student");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await placementAPI.getPosts(searchFilter, tagFilter, yearFilter);
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacementRole = async () => {
    try {
      const res = await placementAPI.getPlacementRole();
      if (res.data?.data?.placementRole) {
        setRole(res.data.data.placementRole);
      }
    } catch (err) {
      console.error("Failed to fetch placement role", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPlacementRole();
  }, [searchFilter, tagFilter, yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFilter(searchQuery);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Placement Experience</h1>
          <p className="text-slate-500 mt-1">Explore interview experiences shared by seniors and alumni.</p>
        </div>
        {(role === "senior" || role === "alumni") && (
          <Link href="/dashboard/placements/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap">
            + Share Experience
          </Link>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex gap-4">
           <input
            type="text"
            className="w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Filter by Tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
          <select 
            className="w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Learning Roadmaps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/placements/dsa" className="block relative group overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 transition-opacity group-hover:opacity-100"></div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6 h-full flex flex-col items-start text-white">
              <div className="p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">DSA Roadmap</h3>
              <p className="text-indigo-100 text-sm mb-4">Step-by-step guide with curated videos & senior questions.</p>
              <div className="mt-auto inline-flex items-center text-xs font-semibold uppercase tracking-wider text-indigo-50 bg-white/20 px-3 py-1.5 rounded-lg">
                View Roadmap &rarr;
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/placements/development" className="block relative group overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-90 transition-opacity group-hover:opacity-100"></div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6 h-full flex flex-col items-start text-white">
              <div className="p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">Web Dev Roadmap</h3>
              <p className="text-cyan-100 text-sm mb-4">Master full-stack development with curated tutorials.</p>
              <div className="mt-auto inline-flex items-center text-xs font-semibold uppercase tracking-wider text-cyan-50 bg-white/20 px-3 py-1.5 rounded-lg">
                View Roadmap &rarr;
              </div>
            </div>
          </Link>
          
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70">
            <h3 className="text-lg font-bold text-slate-400 mb-2">Machine Learning</h3>
            <p className="text-sm text-slate-400">Coming Soon...</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Experiences</h2>
      {loading ? (
        <div className="flex justify-center my-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
           <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-slate-800">No experiences found</h3>
           <p className="text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
             <Link key={post._id} href={`/dashboard/placements/${post._id}`} className="block h-full cursor-pointer transition-transform hover:-translate-y-1">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md flex flex-col h-full h-[280px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">{post.metadata.companyName}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md">
                       {post.metadata.packageCTC} LPA
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{post.metadata.jobRole}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">By {post.author?.name || 'Anonymous'}</p>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" /> <span>Placement Year: {post.metadata.placementYear}</span>
                     </div>
                     {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                           {post.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">{tag}</span>
                           ))}
                           {post.tags.length > 3 && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">+{post.tags.length - 3}</span>}
                        </div>
                     )}
                  </div>
                </div>
             </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
