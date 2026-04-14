"use client";

import { useEffect, useState } from "react";
import { placementAPI } from "@/lib/api";
import Link from "next/link";
import { Bookmark, Building, Calendar, ArrowRight } from "lucide-react";

export default function SavedBookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await placementAPI.getBookmarkedPosts();
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
      <h2 className="text-xl font-serif font-bold text-[#2d2a26] mb-6 uppercase tracking-widest border-b border-[#e6e2d8] pb-2 flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-[#a99c85]" /> Saved Experiences
      </h2>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-[#2d2a26] animate-spin"></div></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[#736d65] font-serif italic">
          You haven&apos;t bookmarked any placement posts yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post._id} href={`/dashboard/placements/${post._id}`} className="block">
              <div className="bg-white rounded-xl border border-[#e6e2d8] shadow-sm hover:shadow-md transition-all h-full flex flex-col group overflow-hidden">
                <div className="p-5 flex-grow flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-2 py-1 bg-[#fcfbf9] text-[#736d65] rounded border border-[#e6e2d8]">
                      {post.metadata?.companyName}
                    </span>
                    <Bookmark className="w-4 h-4 text-[#a99c85] fill-[#a99c85]" />
                  </div>
                  
                  <h3 className="text-lg font-serif font-bold text-[#2d2a26] leading-tight mb-2 group-hover:text-[#a99c85] transition-colors">
                    {post.metadata?.jobRole}
                  </h3>
                  
                  <div className="text-sm font-medium text-[#736d65] mb-4 space-y-1.5 flex-grow">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 opacity-70" />
                      ₹{post.metadata?.packageCTC} LPA
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      Class of {post.metadata?.placementYear}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e6e2d8] flex justify-between items-center mt-auto">
                    <p className="text-xs text-[#736d65] font-medium">By {post.author?.name || 'Anonymous'}</p>
                    <ArrowRight className="w-4 h-4 text-[#a99c85] transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
