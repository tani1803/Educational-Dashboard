"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";

const ROLES = [
  { label: "Student",   value: "student",   hint: "1st - 4th year" },
  { label: "TA",        value: "ta",         hint: "Teaching Assistant" },
  { label: "Professor", value: "professor",  hint: "Faculty" },
  { label: "Alumni",    value: "alumni",     hint: "Graduated" },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    isHOD: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.register(
        formData.name,
        formData.collegeId,
        formData.email,
        formData.password,
        formData.role,
        formData.role === "professor" ? formData.department : undefined,
        formData.role === "professor" ? formData.isHOD : false
      );

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex text-slate-800 bg-white">
      <div className="flex-1 hidden lg:flex bg-gradient-to-br from-indigo-50 to-blue-50 items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-6">Create Your Future.</h1>
          <p className="text-slate-600">Join EduNexus with your college email and get started.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-12 sm:px-24 lg:px-32 xl:px-48 bg-white border-l border-slate-100 overflow-y-auto py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Join EduNexus.</h2>
          <p className="text-slate-500 text-sm">Use your college email (name_roll@iitp.ac.in)</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* Role Selector — 2x2 grid */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left border ${
                    formData.role === r.value
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  <p className="font-semibold">{r.label}</p>
                  <p className={`text-xs mt-0.5 ${formData.role === r.value ? "text-indigo-200" : "text-slate-400"}`}>
                    {r.hint}
                  </p>
                </button>
              ))}
            </div>

            {/* Alumni notice */}
            {formData.role === "alumni" && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ Use your <strong>original college ID</strong> (e.g. 2001AI54). You will get access to the Alumni Portal after login.
              </div>
            )}
          </div>

          {formData.role === "professor" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select Department</option>
                <option value="CSE">CSE</option>
                <option value="Mech">Mechanical Engineering</option>
                <option value="Electrical">Electrical</option>
                <option value="Data Science">Data Science</option>
                <option value="Mathematics and Computing">Mathematics and Computing</option>
                <option value="AI">AI</option>
                <option value="Civil">Civil</option>
                <option value="Humanities">Humanities</option>
                <option value="Unknown">Other / Unknown</option>
              </select>
            </div>
          )}

          {formData.role === "professor" && (
            <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <input 
                type="checkbox" 
                id="isHOD"
                checked={formData.isHOD}
                onChange={(e) => setFormData({ ...formData, isHOD: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="isHOD" className="text-sm font-bold text-indigo-900 cursor-pointer">
                I am the HOD (Head of Department)
                <p className="text-[10px] text-indigo-500 font-medium normal-case mt-0.5">Grants permission to manage TPC Coordinators for your department.</p>
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">College ID</label>
            <input
              type="text"
              value={formData.collegeId}
              onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder={formData.role === "alumni" ? "e.g. 2001AI54 (your original ID)" : "e.g. 2401AI54"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">College Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="name_2401ai54@iitp.ac.in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
