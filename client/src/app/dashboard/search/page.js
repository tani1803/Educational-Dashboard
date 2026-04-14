"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { coursesAPI } from "@/lib/api";
import { Search, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [results, setResults] = useState({ courses: [], assignments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await coursesAPI.globalSearch(query);
        setResults(res.data.data || { courses: [], assignments: [] });
      } catch (error) {
        console.error("Global search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Determine user role to generate correct links to courses dynamically
  const [role, setRole] = useState("student");
  useEffect(() => {
    const r = localStorage.getItem("role");
    if (r) setRole(r.toLowerCase());
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-600" /> 
          Search Results for &quot;{query || "..."}&quot;
        </h1>
        <p className="text-slate-500 mt-1">
          Showing matching courses and assignments from across the platform.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courses Column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Matching Courses ({results.courses.length})
            </h2>
            
            {results.courses.length === 0 ? (
              <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-xl">No courses found matching this query.</p>
            ) : (
              <div className="space-y-4">
                {results.courses.map((course) => (
                  <Link href={`/dashboard/${role}/courses/${course.courseId}`} key={course._id} className="block transition-transform hover:scale-[1.01]">
                    <div className="p-4 border rounded-xl hover:border-indigo-300 hover:shadow-sm bg-slate-50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-16 h-16 text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                        {course.courseId}
                      </span>
                      <h3 className="text-md font-bold text-slate-800 mt-2 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                      {course.instructor && (
                        <p className="text-xs font-medium text-slate-600 mt-3 pt-3 border-t inline-block">Instructor: {course.instructor.name}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Assignments Column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Matching Assignments ({results.assignments.length})
            </h2>

            {results.assignments.length === 0 ? (
              <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-xl">No assignments found matching this query.</p>
            ) : (
              <div className="space-y-4">
                {results.assignments.map((assignment) => (
                   <Link href={`/dashboard/${role}/courses/${assignment.course?.courseId || ''}`} key={assignment._id} className="block transition-transform hover:scale-[1.01]">
                    <div className="p-4 border rounded-xl hover:border-blue-300 hover:shadow-sm bg-blue-50/30 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-16 h-16 text-blue-600" />
                      </div>
                       <h3 className="text-md font-bold text-slate-800 line-clamp-1">{assignment.title}</h3>
                       <p className="text-sm text-slate-500 mt-1 line-clamp-2">{assignment.description}</p>
                       <p className="text-xs font-medium text-blue-600 mt-3 pt-3 border-t inline-block flex items-center gap-1">
                          From Course: {assignment.course ? assignment.course.title : 'Unknown'}
                       </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading interface...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
