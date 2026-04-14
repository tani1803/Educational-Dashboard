"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { BookMarked, ArrowRight, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { coursesAPI } from "@/lib/api";
import Link from "next/link";

// Single accent: teal — #0d9488

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const resMy = await coursesAPI.getMyCourses();
      setCourses(resMy.data.data || []);
      const resAll = await coursesAPI.getAllCourses();
      setAllCourses(resAll.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEnroll = async (courseId) => {
    setEnrollStatus((prev) => ({ ...prev, [courseId]: "loading" }));
    try {
      await coursesAPI.enrollInCourse(courseId);
      setEnrollStatus((prev) => ({ ...prev, [courseId]: "success" }));
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to enroll");
      setEnrollStatus((prev) => ({ ...prev, [courseId]: "error" }));
    }
  };

  const enrolledIds = courses.map((c) => c._id);
  const availableCourses = allCourses.filter((c) => !enrolledIds.includes(c._id));

  return (
    <DashboardLayout requiredRole="student">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-500 mt-1 text-sm">
          View your enrolled courses and browse available ones to join.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center my-16">
          <div className="w-7 h-7 rounded-full border-[3px] border-slate-200 border-t-teal-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Enrolled Courses ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-700 uppercase tracking-wide">
                Enrolled Courses
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {courses.length} course{courses.length !== 1 ? "s" : ""}
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                You are not enrolled in any courses right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((c) => (
                  <Link
                    key={c._id}
                    href={`/dashboard/student/courses/${c.courseId}`}
                    className="block h-full"
                  >
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full hover:border-teal-500 hover:shadow-sm transition-all cursor-pointer">
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
                          <BookMarked className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {c.courseId}
                        </span>
                      </div>

                      {/* Course info */}
                      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex-grow mb-5">
                        {c.instructor?.name || "Instructor"}
                      </p>

                      {/* Go to course footer */}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-1.5 text-teal-600 text-xs font-semibold">
                        Go to Course <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Available Courses ── */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-base font-semibold text-slate-700 uppercase tracking-wide">
                Available to Join
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {availableCourses.length} available
              </span>
            </div>

            {availableCourses.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                No new courses available for enrollment right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableCourses.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {c.courseId}
                      </span>
                    </div>

                    {/* Course info */}
                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex-grow line-clamp-2 mb-5">
                      {c.description || "No description provided."}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-medium">
                        By {c.instructor?.name || "Unknown"}
                      </p>
                      <button
                        onClick={() => handleEnroll(c.courseId)}
                        disabled={
                          enrollStatus[c.courseId] === "loading" ||
                          enrollStatus[c.courseId] === "success"
                        }
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {enrollStatus[c.courseId] === "loading"
                          ? "Enrolling…"
                          : enrollStatus[c.courseId] === "success"
                          ? "Enrolled!"
                          : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" /> Enroll
                            </>
                          )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
