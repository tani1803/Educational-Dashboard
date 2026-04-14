"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { coursesAPI, assignmentsAPI } from "@/lib/api";
import { BookMarked, Search, Users, Calendar, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function StudentCourseDetail({ params }) {
  const [course, setCourse] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  
  const [submittingId, setSubmittingId] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const p = await Promise.resolve(params);
        setCourseCode(p.id);
        const res = await coursesAPI.getCourse(p.id);
        setCourse(res.data.data);
        
        // Fetch assignments
        const assRes = await assignmentsAPI.getAssignments(p.id);
        setAssignments(assRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingAssignments(false);
      }
    };
    run();
  }, [params]);

  useEffect(() => {
    if (!searchQuery.trim() || !courseCode) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, courseCode]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !courseCode) return;
    setSearching(true);
    try {
      const res = await coursesAPI.searchStudents(courseCode, searchQuery);
      const data = res.data.data || [];
      setSearchResults(data);
      if (data.length === 0 && res.data.debug) {
         window.lastSearchDebug = res.data.debug;
      }
    } catch (err) {
      console.error(err);
      alert("Trie Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSearching(false);
    }
  };

  const handleFileChange = (e, asmntTitle) => {
    if (e.target.files?.[0]) {
      submitFile(asmntTitle, e.target.files[0]);
    }
  };

  const submitFile = async (assignmentTitle, file) => {
    setSubmittingId(assignmentTitle);
    try {
      const formData = new FormData();
      formData.append("assignmentTitle", assignmentTitle);
      formData.append("file", file);
      await assignmentsAPI.submitAssignment(courseCode, formData);
      alert(`Successfully submitted ${assignmentTitle}!`);
    } catch (err) {
      alert("Submission failed. Ensure it is a .zip file and you are enrolled.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <DashboardLayout requiredRole="student"><div className="flex justify-center mt-20"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div></DashboardLayout>;
  if (!course) return <DashboardLayout requiredRole="student"><div className="mt-20 text-center text-slate-500">Course not found.</div></DashboardLayout>;

  return (
    <DashboardLayout requiredRole="student">
      <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 mb-4">{course.courseId}</span>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{course.title}</h1>
          <p className="text-slate-600 max-w-3xl mb-4">{course.description}</p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50 inline-flex px-4 py-2 rounded-xl border border-slate-100">
            <BookMarked className="w-4 h-4" /> Instructor: <span className="font-semibold text-slate-700">{course.instructor?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <Calendar className="w-5 h-5 text-indigo-500" /> Active Assignments
            </h2>
            
            {loadingAssignments ? (
              <div className="text-center p-6 text-slate-400">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                No assignments posted for this course yet.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((asmnt) => (
                  <div key={asmnt._id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-slate-800">{asmnt.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{asmnt.description}</p>
                      {asmnt.fileUrl && (
                        <a href={`http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || '5000'}/${asmnt.fileUrl}`} target="_blank" className="text-xs text-indigo-600 mt-2 inline-block hover:underline">Download Attached Resource</a>
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        id={`file-${asmnt._id}`} 
                        className="hidden" 
                        accept=".zip,.rar,.pdf"
                        onChange={(e) => handleFileChange(e, asmnt.title)}
                      />
                      <label 
                        htmlFor={`file-${asmnt._id}`}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2"
                      >
                        {submittingId === asmnt.title ? 'Uploading...' : <><UploadCloud className="w-4 h-4" /> Submit</>}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-8">
          {/* Trie Search Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-4">
              <Users className="w-5 h-5 text-indigo-500" /> Enrolled Students
            </h2>
            <p className="text-sm text-slate-500 mb-4 items-center">
               Trie Engine enabled. Total: {course.students?.length || 0}
            </p>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Prefix search (e.g. 'tan')"
                  className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={searching}
                  className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg text-xs font-medium transition-colors"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="max-h-64 overflow-y-auto pr-2">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Results</h3>
                  {searchResults.map((st) => (
                    <div key={st._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {st.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none">{st.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{st.collegeId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchQuery && !searching && (
                  <div className="text-center p-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-sm">
                    No students matched &apos;{searchQuery}&apos;. 
                    {typeof window !== 'undefined' && window.lastSearchDebug && (
                      <span className="block mt-2 font-mono text-xs text-orange-400 break-all text-left bg-orange-100 p-2 rounded">
                        Raw C++ Output: {JSON.stringify(window.lastSearchDebug.rawOutput)}<br/>
                        Args Sent: {JSON.stringify(window.lastSearchDebug.args)}<br/>
                        Matched Names Array: {JSON.stringify(window.lastSearchDebug.matchedNames)}
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
            
            {!searchQuery && course.students && course.students.map((st) => (
              <div key={st._id} className="flex items-center justify-between p-3 border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-700">{st.name}</p>
                <p className="text-xs text-slate-500">{st.collegeId}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
