"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trophy, Activity, Trash2 } from "lucide-react";
import { contestPerformanceAPI } from "@/lib/api";

export default function ContestAnalytics() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    contestName: "",
    rank: "",
    totalParticipants: "",
    datePlayed: ""
  });

  const fetchData = async () => {
    try {
      const res = await contestPerformanceAPI.getPerformances();
      const sanitized = (res.data?.data || []).map(p => ({
        ...p,
        displayDate: new Date(p.datePlayed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
      setPerformances(sanitized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contestPerformanceAPI.addPerformance(formData);
      setShowModal(false);
      setFormData({ contestName: "", rank: "", totalParticipants: "", datePlayed: "" });
      fetchData();
    } catch (err) {
      alert("Failed to save performance analytics.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await contestPerformanceAPI.deletePerformance(id);
      fetchData();
    }
  };

  const avgPerformance = performances.length 
    ? (performances.reduce((acc, curr) => acc + curr.performanceScore, 0) / performances.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2d2a26] flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Contest Analytics
          </h2>
          <p className="text-[#736d65] text-sm mt-1">Track your relative performance in competitive coding.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#2d2a26] hover:bg-[#1a1816] text-[#fcfaf7] px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {!loading && performances.length === 0 ? (
        <div className="text-center py-10 bg-[#fcfaf7] rounded-xl border border-dashed border-[#e6e2d8]">
          <Trophy className="w-8 h-8 text-[#d1ccc1] mx-auto mb-2" />
          <p className="text-[#736d65] font-medium">No contest data available</p>
          <p className="text-xs text-[#a99c85]">Add your first contest rank to see the graph.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
             <div className="px-4 py-3 bg-[#fcfaf7] border border-[#e6e2d8] rounded-xl">
                <p className="text-xs font-bold text-[#a99c85] uppercase tracking-widest">Avg Percentile</p>
                <p className="text-xl font-bold text-[#2d2a26]">{avgPerformance}%</p>
             </div>
             <div className="px-4 py-3 bg-[#fcfaf7] border border-[#e6e2d8] rounded-xl">
                <p className="text-xs font-bold text-[#a99c85] uppercase tracking-widest">Contests</p>
                <p className="text-xl font-bold text-[#2d2a26]">{performances.length}</p>
             </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performances} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e2d8" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#a99c85', fontSize: 12}} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#a99c85', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d2a26', border: 'none', borderRadius: '12px', color: '#fcfaf7' }}
                  itemStyle={{ color: '#a99c85' }}
                  cursor={{ stroke: '#a99c85', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  name="Performance Percentile"
                  dataKey="performanceScore" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* History list */}
          <div className="mt-8 space-y-3">
             <h3 className="text-sm font-bold text-[#736d65] uppercase tracking-widest border-b border-[#e6e2d8] pb-2">History</h3>
             {[...performances].reverse().map(p => (
               <div key={p._id} className="flex justify-between items-center bg-[#fcfaf7] p-3 rounded-lg border border-[#e6e2d8]">
                 <div>
                   <p className="font-bold text-[#2d2a26] text-sm">{p.contestName}</p>
                   <p className="text-xs text-[#a99c85]">{p.displayDate} • Rank {p.rank} / {p.totalParticipants}</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="font-bold text-[#4f46e5] text-sm">{p.performanceScore}%</span>
                   <button onClick={() => handleDelete(p._id)} className="text-[#d1ccc1] hover:text-red-500 transition">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-[#2d2a26]/40 backdrop-blur-sm">
          <div className="bg-[#fcfaf7] w-full max-w-md rounded-2xl shadow-2xl border border-[#e6e2d8] overflow-hidden">
            <div className="p-6 bg-white border-b border-[#e6e2d8]">
              <h3 className="text-lg font-bold text-[#2d2a26]">Log Contest Results</h3>
              <p className="text-xs text-[#736d65] mt-1">Record your standing to map your growth curve over time.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#736d65] uppercase tracking-widest mb-1">Contest Name</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-[#e6e2d8] focus:border-[#a99c85] focus:ring-1 focus:ring-[#a99c85] outline-none transition" placeholder="e.g. LeetCode Weekly 400" value={formData.contestName} onChange={e => setFormData({...formData, contestName: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#736d65] uppercase tracking-widest mb-1">Your Rank</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 rounded-lg border border-[#e6e2d8] focus:border-[#a99c85] outline-none" placeholder="10" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#736d65] uppercase tracking-widest mb-1">Total Players</label>
                  <input required type="number" min="1" className="w-full px-4 py-2.5 rounded-lg border border-[#e6e2d8] focus:border-[#a99c85] outline-none" placeholder="200" value={formData.totalParticipants} onChange={e => setFormData({...formData, totalParticipants: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#736d65] uppercase tracking-widest mb-1">Date</label>
                <input required type="date" className="w-full px-4 py-2.5 rounded-lg border border-[#e6e2d8] focus:border-[#a99c85] outline-none text-[#736d65]" value={formData.datePlayed} onChange={e => setFormData({...formData, datePlayed: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e2d8] mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold text-[#736d65] hover:bg-[#e6e2d8] rounded-lg transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 font-bold text-[#fcfaf7] bg-[#4f46e5] hover:bg-[#4338ca] rounded-lg transition shadow-md shadow-indigo-500/20 disabled:opacity-50">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
