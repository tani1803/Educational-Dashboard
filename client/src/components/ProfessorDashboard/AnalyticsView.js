"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";

const AnalyticsView = ({ distributionData = [], atRiskStudents = [], classAverage = 0 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Class Performance Chart */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Class Performance Distribution
          </h2>
          <div className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
            Avg: {classAverage.toFixed(1)}%
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <RechartsTooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="students" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <ReferenceLine y={classAverage} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#EF4444', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-Risk Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          At-Risk Students
        </h2>
        <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wider">{"finalScore < 50%"}</p>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {atRiskStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 h-full py-8 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium">Great job! No students are currently at risk.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskStudents.map((student, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-red-100 bg-red-50/30 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.studentId} • {student.courseId}</p>
                  </div>
                  <div className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded text-sm border border-red-200">
                    {student.finalScore.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
