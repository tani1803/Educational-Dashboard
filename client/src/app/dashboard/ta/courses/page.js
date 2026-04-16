"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { BookMarked, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api"; // Assuming a default axios or fetch wrapper exists

export default function TACourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // The newly created endpoint for TA assigned courses
      const res = await api.get("/ta/assigned-courses");
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch TA courses", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout requiredRole="ta">
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">My TA Assignments</h1>
        <p className="text-slate-500 mt-1 text-sm">
          View the courses you are actively assisting as a Teaching Assistant.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center my-16">
          <div className="w-7 h-7 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : (
        <section className="mb-12">
          {courses.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              You haven't been assigned to TA any courses yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Link
                  key={c._id}
                  href={`/dashboard/ta/courses/${c.courseId}`}
                  className="block h-full"
                >
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                        {c.courseId}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex-grow mb-5">
                      Role: Teaching Assistant
                    </p>

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
                      Manage Submissions <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
