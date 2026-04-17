"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import ContestAnalytics from "@/components/Dashboard/Student/ContestAnalytics";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/placements" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-semibold mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Placement Hub
        </Link>
      </div>

      <div className="max-w-6xl mx-auto py-4">
        <div className="mb-8">
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Performance</h1>
           <p className="text-slate-500 mt-2 text-lg">Analyze your contest rankings, compare percentiles, and visualize your growth trajectory across hackathons.</p>
        </div>

        <ContestAnalytics />
      </div>
    </DashboardLayout>
  );
}
