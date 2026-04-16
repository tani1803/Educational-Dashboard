"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useEffect, useState } from "react";
import { BookOpen, Users, FilePlus, Shield, CheckCircle2, Circle, UserPlus } from "lucide-react";
import { coursesAPI, tpcAPI, userAPI, alumniAPI, taAPI } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfessorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSeniors, setAllSeniors] = useState([]);
  const [pendingTalks, setPendingTalks] = useState([]);
  const [taRequests, setTaRequests] = useState([]);
  const [tpcLoading, setTpcLoading] = useState(false);
  const [isHOD, setIsHOD] = useState(false);
  const [userDept, setUserDept] = useState("");

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchTpcData();
    fetchTaRequests();
    checkProfile();
  }, []);

  async function fetchTaRequests() {
    try {
      const res = await taAPI.getProfessorRequests();
      // Filter out only pending ones
      const pending = (res.data?.data || []).filter(r => r.status === "pending");
      setTaRequests(pending);
    } catch (e) {
      console.error("Failed to fetch TA requests", e);
    }
  }

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await coursesAPI.getMyCourses();
      setCourses(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  }
  async function checkProfile() {
    try {
      const me = await userAPI.getMe();
      const userData = me.data?.data;
      setUserDept(userData?.department || "N/A");
      setIsHOD(userData?.isHOD || false);

      if (userData?.isHOD) {
        const pending = await alumniAPI.getPendingTalks();
        setPendingTalks(pending.data?.data || []);
      }
    } catch (e) { }
  }

  async function handleReview(id, status) {
    try {
      await alumniAPI.reviewTalk(id, status);
      // Refresh pending list
      const pending = await alumniAPI.getPendingTalks();
      setPendingTalks(pending.data?.data || []);
    } catch (e) {
      alert("Failed to review post.");
    }
  }

  async function handleApproveTaRequest(id) {
    try {
      await taAPI.approveRequest(id);
      alert("TA Request Approved Successfully!");
      fetchTaRequests();
    } catch (e) {
      console.error(e);
      alert("Failed to approve TA request.");
    }
  }

  async function fetchTpcData() {
    setTpcLoading(true);
    try {
      const res = await tpcAPI.getSeniors();
      setAllSeniors(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setTpcLoading(false);
    }
  }

  async function handleToggleTpc(userId) {
    try {
      await tpcAPI.toggleCoord(userId);
      fetchTpcData();
    } catch (e) {
      console.error("Failed to update TPC status.", e);
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coursesAPI.createCourse({ courseId, title, description });
      setShowCreateForm(false);
      setCourseId("");
      setTitle("");
      setDescription("");
      fetchCourses();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout requiredRole="professor">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Professor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your courses and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            {showCreateForm ? 'Cancel Creation' : 'Create Course'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code (e.g. CS101)</label>
                <input
                  type="text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                rows="3"
                required
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                {submitting ? 'Creating...' : 'Publish Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TPC Coordinator Management ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">TPC Coordinator Management</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">Toggle coordinator status for seniors in your department.</p>

        {tpcLoading ? (
          <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" /></div>
        ) : allSeniors.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">No seniors found in your department.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">College ID</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TPC Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allSeniors.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{u.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded mt-0.5 ${u.placementRole === "senior" ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-500"}`}>
                          {u.placementRole || "Student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{u.collegeId}</td>
                    <td className="px-6 py-4 text-center">
                      {u.isTpcCoord ? (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Coord
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-medium border border-slate-100">
                          <Circle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleTpc(u._id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${u.isTpcCoord
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                          }`}
                      >
                        {u.isTpcCoord ? "Revoke Access" : "Grant Access"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-indigo-600">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Faculty Member</h3>
            <p className="text-xs text-slate-500 font-medium">Branch: {userDept}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-600">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{courses.length} Courses</h3>
            <p className="text-xs text-slate-500 font-medium">Teaching assignments</p>
          </div>
        </div>
      </div>

      {/* ── Pending Alumni Approvals ── */}
      {isHOD && pendingTalks.length > 0 && (
        <div className="mb-14 bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Pending Alumni Submissions
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium ml-13">Review and approve industry insights before they are published.</p>
            </div>
            <span className="bg-white px-4 py-2 rounded-xl border border-indigo-100 text-indigo-600 font-bold text-sm shadow-sm">
              {pendingTalks.length} Waiting
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {pendingTalks.map((talk) => (
              <div key={talk._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-indigo-50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {talk.type === 'tedtalk' ? 'TED Talk' : 'Tech Update'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">By {talk.author?.name} · {talk.author?.department}</span>
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

      {/* ── Pending TA Requests ── */}
      {taRequests.length > 0 && (
        <div className="mb-14 bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                Pending TA Applications
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium ml-13">Review applications from MTech students offering to assist in your courses.</p>
            </div>
            <span className="bg-white px-4 py-2 rounded-xl border border-indigo-100 text-indigo-600 font-bold text-sm shadow-sm">
              {taRequests.length} Waiting
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">
            {taRequests.map((req) => (
              <div key={req._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-indigo-50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      MTech Applicant
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">Col. ID: {req.student?.collegeId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{req.student?.name}</h3>
                  <p className="text-sm border-l-2 border-indigo-200 pl-3 text-slate-500 font-medium">Course: {req.course?.title} ({req.course?.courseId})</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApproveTaRequest(req._id)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
                  >
                    Approve Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-4">Your Courses</h2>
      {loading ? (
        <div className="flex justify-center my-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div></div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border shadow-sm mb-10 text-slate-500">
          You haven&apos;t created any courses yet. Click &quot;Create Course&quot; to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link key={c._id} href={`/dashboard/professor/courses/${c.courseId}`} className="block">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{c.courseId}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-auto pt-4 border-t border-slate-50">
                  <Users className="w-4 h-4" />
                  <span>{c.students?.length || 0} Students Enrolled</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
