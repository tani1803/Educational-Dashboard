"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";
import { ShieldCheck, MailCheck } from "lucide-react";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otpString = otp.join("");
    if (otpString.length < 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOTP(email, otpString);
      setSuccess("Account verified! Redirecting to login...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 w-full max-w-md text-center">

        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8 text-indigo-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h1>
        <p className="text-slate-500 text-sm mb-2">
          We sent a 4-digit OTP to
        </p>
        <p className="text-indigo-600 font-semibold text-sm mb-8 break-all">
          {email}
        </p>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-xl text-sm border border-green-100 flex items-center gap-2 justify-center">
            <ShieldCheck className="w-4 h-4" /> {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          OTP expires in 5 minutes. Wrong email?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Go back
          </span>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
