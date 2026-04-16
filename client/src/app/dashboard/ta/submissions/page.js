"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import AssignmentHub from "@/components/Dashboard/Student/AssignmentHub";
import { useEffect, useState } from "react";

export default function TASubmissions() {
  const [user, setUser] = useState({
    name: "MTech Student",
    department: "Unknown",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser((prev) => ({ ...prev, ...JSON.parse(storedUser) }));
    }
  }, []);

  return (
    <DashboardLayout requiredRole="ta">
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] bg-[#fcfaf7]">
        
        {/* Header Section */}
        <div className="mb-8 p-6 bg-white rounded-xl border border-[#e6e2d8] shadow-sm flex flex-col md:flex-row justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d2a26] leading-tight">
              My Submissions, <span className="text-[#a99c85]">{user.name}</span>.
            </h1>
            <p className="text-[#736d65] mt-2 font-medium tracking-wide">
              Manage the coursework for courses you are officially enrolled in as an MTech student.
            </p>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="flex flex-col gap-8">
          <div className="w-full space-y-8">
            {/* The AssignmentHub inherently interacts with the API endpoints for enrolled student courses */}
            <AssignmentHub />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
