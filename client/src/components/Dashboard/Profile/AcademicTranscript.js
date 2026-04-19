"use client";

import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api";
import { BookOpen, GraduationCap, Award } from "lucide-react";

export default function AcademicTranscript({ user }) {
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Real-time calculation states to ensure it always matches table
  const [liveCgpa, setLiveCgpa] = useState(user.cgpa || 0);
  const [liveCredits, setLiveCredits] = useState(user.totalCreditsEarned || 0);

  useEffect(() => {
    fetchTranscript();
  }, []);

  const fetchTranscript = async () => {
    try {
      const res = await userAPI.getTranscript();
      const records = res.data.data;
      setTranscript(records);
      
      // Compute dynamically to never fall out of sync
      let totCred = 0;
      let totPts = 0;
      records.forEach(r => {
         const cr = r.course?.credits || 3;
         let pt = 0;
         switch(r.finalGrade?.trim().toUpperCase()) {
            case "AA": pt = 10; break;
            case "AB": pt = 9; break;
            case "BB": pt = 8; break;
            case "BC": pt = 7; break;
            case "CC": pt = 6; break;
            case "CD": pt = 5; break;
            case "DD": pt = 4; break;
            case "F": pt = 0; break;
         }
         totCred += cr;
         totPts += pt * cr;
      });
      
      if(totCred > 0) {
         setLiveCgpa(totPts / totCred);
         setLiveCredits(totCred);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/50 rounded-xl p-6 border border-[#e6e2d8] flex items-center gap-6">
          <div className="w-14 h-14 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl flex items-center justify-center">
             <Award className="w-7 h-7 text-[#a99c85]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#736d65] uppercase tracking-widest">Cumulative GPA</p>
            <h3 className="text-3xl font-serif font-bold text-[#2d2a26] mt-1">{liveCgpa ? liveCgpa.toFixed(2) : "0.00"}</h3>
          </div>
        </div>

        <div className="bg-white/50 rounded-xl p-6 border border-[#e6e2d8] flex items-center gap-6">
          <div className="w-14 h-14 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl flex items-center justify-center">
             <GraduationCap className="w-7 h-7 text-[#a99c85]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#736d65] uppercase tracking-widest">Total Credits</p>
            <h3 className="text-3xl font-serif font-bold text-[#2d2a26] mt-1">{liveCredits || 0}</h3>
          </div>
        </div>
      </div>

      {/* Transcript Table */}
      <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
        <h2 className="text-xl font-serif font-bold text-[#2d2a26] mb-6 uppercase tracking-widest border-b border-[#e6e2d8] pb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#a99c85]" /> Course History
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-t-[#2d2a26] animate-spin"></div></div>
        ) : errorMessage ? (
          <div className="text-center py-12 text-[#736d65] font-serif italic text-lg text-red-500">
            {errorMessage}
          </div>
        ) : transcript.length === 0 ? (
          <div className="text-center py-12 text-[#736d65] font-serif italic">
            No graded courses found in your transcript yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#4a4744]">
              <thead className="bg-[#fcfbf9] border-b border-[#e6e2d8]">
                <tr>
                  <th className="px-4 py-3 font-serif font-semibold w-24">Course ID</th>
                  <th className="px-4 py-3 font-serif font-semibold">Course Name</th>
                  <th className="px-4 py-3 font-serif font-semibold">Credits</th>
                  <th className="px-4 py-3 font-serif font-semibold text-right">Final Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8]">
                {transcript.map((gradeRecord) => (
                  <tr key={gradeRecord._id} className="hover:bg-[#fcfaf7] transition-colors">
                    <td className="px-4 py-4 font-bold text-[#2d2a26]">{gradeRecord.course?.courseId}</td>
                    <td className="px-4 py-4 font-medium">{gradeRecord.course?.title}</td>
                    <td className="px-4 py-4 text-[#736d65]">{gradeRecord.course?.credits || 3}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-[#8b9d83]/10 text-[#8b9d83] px-3 py-1 rounded-md font-bold border border-[#8b9d83]/20">
                        {gradeRecord.finalGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
