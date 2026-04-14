"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { coursesAPI, assignmentsAPI } from "@/lib/api";
import { Search, Users, Calendar, ArrowLeft, FilePlus, CheckCircle } from "lucide-react";
import Link from "next/link";
import GradesManager from "@/components/Dashboard/Professor/GradesManager";

export default function ProfessorCourseDetail({ params }) {
  const [course, setCourse] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const p = await Promise.resolve(params); 
        setCourseCode(p.id);
        fetchCourse(p.id);
        loadAssignments(p.id);
        loadSubmissions(p.id);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    run();
  }, [params]);

  const fetchCourse = async (cid) => {
    try {
      const res = await coursesAPI.getCourse(cid);
      setCourse(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (cid) => {
    try {
      const res = await assignmentsAPI.getAssignments(cid);
      setAssignments(res.data.data || []);
    } catch (e) { console.error(e) }
  };

  const loadSubmissions = async (cid) => {
    try {
      const res = await assignmentsAPI.getSubmissions(cid);
      setSubmissions(res.data.data || []);
    } catch (e) { console.error(e) }
    setLoadingSubmissions(false);
  };

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

  const submitNewAssignment = async (e) => {
    e.preventDefault();
    if (!title || !desc || !file) {
      return alert("Title, definition, and file are required.");
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("file", file);

    setSubmitting(true);
    try {
      await assignmentsAPI.createAssignment(courseCode, formData);
      alert("Lesson/Assignment Published Successfully!");
      setTitle(""); setDesc(""); setFile(null);
      setShowAddForm(false);
      loadAssignments(courseCode);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Error adding assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout requiredRole="professor"><div className="flex justify-center mt-20"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div></DashboardLayout>;
  if (!course) return <DashboardLayout requiredRole="professor"><div className="mt-20 text-center text-slate-500">Course not found.</div></DashboardLayout>;

  return (
    <DashboardLayout requiredRole="professor">
      <Link href="/dashboard/professor" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 mb-4">{course.courseId}</span>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{course.title}</h1>
            <p className="text-slate-600 max-w-3xl mb-4">{course.description}</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" /> {showAddForm ? 'Cancel Form' : 'Add Assignment'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {showAddForm && (
            <form onSubmit={submitNewAssignment} className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                <h3 className="font-bold text-slate-800 mb-4">Create New Assignment</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Assignment Title" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <textarea placeholder="Description" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={desc} onChange={(e) => setDesc(e.target.value)} required rows={3}></textarea>
                  <input type="file" className="w-full p-3 border rounded-xl bg-slate-50" onChange={(e) => setFile(e.target.files[0])} required />
                  <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-full py-2.5 rounded-xl font-medium transition-colors">
                    {submitting ? 'Publishing...' : 'Publish Assignment'}
                  </button>
                </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-4">
              <Calendar className="w-5 h-5 text-indigo-500" /> Managed Assignments 
            </h2>
            
            {assignments.length === 0 ? (
              <div className="text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                You haven&apos;t posted any assignments.
              </div>
            ) : (
               <div className="space-y-4">
                  {assignments.map((asmnt) => (
                    <div key={asmnt._id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 transition-colors">
                      <h3 className="font-bold text-slate-800 text-lg">{asmnt.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{asmnt.description}</p>
                      
                      {asmnt.fileUrl && (
                         <div className="mt-4 flex gap-4 text-sm font-semibold text-indigo-600">
                          <a href={`http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || '5000'}/${asmnt.fileUrl}`} target="_blank" className="bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">View Uploaded Material</a>
                         </div>
                      )}
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <CheckCircle className="w-5 h-5 text-indigo-500" /> Student Submissions
            </h2>
            
            {loadingSubmissions ? (
              <div className="text-center p-6 text-slate-400">Loading tracking lists...</div>
            ) : submissions.length === 0 ? (
              <div className="text-slate-500 border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                No student submissions found.
              </div>
            ) : (
               <div className="space-y-4">
                 {submissions.map((sub) => (
                    <div key={sub._id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <h3 className="font-bold text-slate-800">{sub.assignmentTitle}</h3>
                        </div>
                        <p className="text-sm text-slate-500">Submitted by: <span className="font-medium text-slate-700">{sub.student?.name} ({sub.student?.collegeId})</span></p>
                        
                        {sub.fileUrl && (
                          <a href={`http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || '5000'}/${sub.fileUrl}`} target="_blank" className="text-xs text-indigo-600 font-semibold mt-3 inline-block hover:underline">Download Submission File</a>
                        )}
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
               Trie Engine enabled. Total: {course.students?.length}
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
              <div key={st._id} className="flex items-center justify-between p-3 border-b last:border-0 border-slate-100">
                <p className="text-sm font-medium text-slate-700">{st.name}</p>
                <p className="text-xs text-slate-500">{st.collegeId || st.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <GradesManager 
          course={course} 
          isPublished={course.gradesPublished} 
          onCourseUpdated={() => fetchCourse(courseCode)}
        />
      </div>
    </DashboardLayout>
  );
}
