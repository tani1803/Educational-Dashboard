"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { placementAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; 
import { Plus, Trash2, Send, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Dynamically import ReactQuill so it doesn't break SSR in Next.js
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false, loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-200"></div> });

export default function NewPlacementExperience() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [metadata, setMetadata] = useState({
    companyName: "",
    jobRole: "",
    packageCTC: "",
    placementYear: new Date().getFullYear()
  });

  const [role, setRole] = useState("student");
  
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const feedUrl = role === "alumni" ? "/dashboard/alumni" : "/dashboard/placements";

  const [rounds, setRounds] = useState([
    { roundName: "Round 1:", details: "" }
  ]);

  const [tips, setTips] = useState("");
  
  const [tagsInput, setTagsInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleMetadataChange = (e) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  const handleAddRound = () => {
    setRounds([...rounds, { roundName: `Round ${rounds.length + 1}:`, details: "" }]);
  };

  const handlRemoveRound = (index) => {
    const updated = rounds.filter((_, i) => i !== index);
    setRounds(updated);
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const handleSubmit = async (status) => {
    setSubmitting(true);
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t !== "");
      
      const payload = {
        metadata: {
          ...metadata,
          packageCTC: Number(metadata.packageCTC),
          placementYear: Number(metadata.placementYear)
        },
        content: {
          rounds,
          tips
        },
        tags,
        status, // "draft" or "published"
        privacy: { isAnonymous }
      };

      await placementAPI.createPost(payload);
      
      // Redirect to dashboard based on role
      router.push(feedUrl);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <Link href={feedUrl} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Share Interview Experience</h1>
        <p className="text-slate-500 mb-8">Pay it forward by sharing your exact rounds, questions, and insights to help juniors.</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           
           {/* Section: Metadata */}
           <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <h2 className="text-lg font-bold text-slate-800 mb-4">1. Basic Details</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                   <input type="text" name="companyName" required value={metadata.companyName} onChange={handleMetadataChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google, Microsoft, Startup Inc" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Job Role</label>
                   <input type="text" name="jobRole" required value={metadata.jobRole} onChange={handleMetadataChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. SDE-1, Data Analyst" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Package (CTC in LPA)</label>
                   <input type="number" name="packageCTC" required step="0.1" value={metadata.packageCTC} onChange={handleMetadataChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 24.5" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Placement Year</label>
                   <input type="number" name="placementYear" required value={metadata.placementYear} onChange={handleMetadataChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
             </div>
           </div>

           {/* Section: Rounds */}
           <div className="p-8 border-b border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">2. Interview Rounds</h2>
                <button onClick={handleAddRound} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                   <Plus className="w-4 h-4" /> Add Round
                </button>
             </div>

             <div className="space-y-10">
                {rounds.map((round, index) => (
                   <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 relative">
                     <div className="flex gap-4 mb-4 items-start">
                        <div className="flex-1">
                           <label className="block text-sm font-bold text-slate-700 mb-1">Round Title</label>
                           <input 
                              type="text" 
                              value={round.roundName} 
                              onChange={(e) => handleRoundChange(index, "roundName", e.target.value)} 
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-400 font-medium" 
                              placeholder="e.g. Round 1: Online Assessment (Hackerrank)"
                           />
                        </div>
                        {rounds.length > 1 && (
                          <button onClick={() => handlRemoveRound(index)} className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove Round">
                             <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                     </div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Questions & Experience</label>
                     <div className="rounded-lg overflow-hidden border border-slate-200">
                       <ReactQuill theme="snow" value={round.details} onChange={(val) => handleRoundChange(index, "details", val)} className="bg-white" />
                     </div>
                   </div>
                ))}
             </div>
           </div>

           {/* Section: Tips */}
           <div className="p-8 border-b border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-4">3. Tips & Advice</h2>
             <p className="text-sm text-slate-500 mb-3">Any advice on what to study, how to negotiate, or resources used.</p>
             <div className="rounded-lg overflow-hidden border border-slate-200">
                <ReactQuill theme="snow" value={tips} onChange={setTips} className="bg-white" />
             </div>
           </div>

           {/* Section: Final Touches */}
           <div className="p-8 bg-slate-50/50">
             <h2 className="text-lg font-bold text-slate-800 mb-4">4. Visibility & Tags</h2>
             <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1">Tags (Comma Separated)</label>
                <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. C++, System Design, On-Campus, SDE" />
             </div>

             <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <input type="checkbox" id="anon" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded border-slate-300" />
                <label htmlFor="anon" className="font-medium text-slate-700 cursor-pointer">Post Anonymously</label>
             </div>
           </div>
           
           {/* Actions */}
           <div className="p-6 bg-slate-800 flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => handleSubmit("draft")}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium hover:bg-slate-700 transition"
              >
                 <Save className="w-4 h-4" /> Save as Draft
              </button>
              <button 
                onClick={() => handleSubmit("published")}
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-8 py-2.5 rounded-xl text-white font-bold transition shadow-md shadow-indigo-500/20"
              >
                 <Send className="w-4 h-4" /> Publish Experience
              </button>
           </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
