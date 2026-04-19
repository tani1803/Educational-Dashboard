"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import AssignmentHub from "@/components/Dashboard/Student/AssignmentHub";

export default function StudentDashboard() {
  const [user, setUser] = useState({
    name: "Student",
    department: "Unknown",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(prev => ({ ...prev, ...JSON.parse(storedUser) }));
    }
  }, []);

  return (
    <DashboardLayout requiredRole="student">
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] bg-[#fcfaf7]">
        
        {/* Header Section */}
        <div className="mb-8 p-6 bg-white rounded-xl border border-[#e6e2d8] shadow-sm flex flex-col md:flex-row justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d2a26] leading-tight">
              Welcome back, <span className="text-[#a99c85]">{user.name}</span>.
            </h1>
            <p className="text-[#736d65] mt-2 font-medium tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-[#fcfaf7] border border-[#e6e2d8] rounded-lg">
            <p className="text-xs font-bold text-[#736d65] uppercase tracking-widest text-center">Department</p>
            <p className="text-[#2d2a26] font-serif font-semibold mt-1">{user.department}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full space-y-8">
          <AssignmentHub />
        </div>
      </div>
    </DashboardLayout>
  );
}
