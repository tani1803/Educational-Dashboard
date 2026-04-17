"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";

const RectFace = ({ color, width, height, delay, focusState, collegeId, zIndex }) => {
  const isTurned = focusState === "password";

  const getPupilsTransform = (eyeIndex) => {
    if (focusState === "username") {
      const maxChars = 25;
      const length = Math.min(collegeId.length, maxChars);
      
      // Look towards the form on the right
      const baseLookX = 14; 
      
      // subtle tracking effect as text gets longer
      const typingX = (length / maxChars) * 12;
      const typingY = (length / maxChars) * 4;
      
      // Make it realistic by adding slight, unique jitter to X and Y per face & eye
      const jitterX = Math.sin(length * 0.5 + delay + eyeIndex) * 2;
      const jitterY = Math.cos(length * 0.8 + delay + eyeIndex) * 1.5;
      
      const xOffset = baseLookX + typingX + jitterX;
      const yOffset = typingY + jitterY;
      return `translate(${xOffset}px, ${yOffset}px)`;
    }
    return "translate(0px, 0px)";
  };

  let bodyTransform = "rotateY(0deg)";
  if (isTurned) {
    bodyTransform = "rotateY(180deg)";
  } else if (focusState === "username") {
    // Physically turn the bodies to face the text box (to their right)
    // Vary the rotation slightly for each creature to make it organic
    const rotateAngle = 10 + (width % 15);
    bodyTransform = `rotateY(${rotateAngle}deg)`;
  }

  return (
    <div 
      className="relative shrink-0"
      style={{
        width, height,
        zIndex,
        perspective: "1000px",
        marginLeft: "-15px",
        marginRight: "-15px", // Force overlap exactly like the sketch
        marginBottom: "-20px" // Push them slightly past the bottom edge
      }}
    >
      <div 
        className="w-full h-full relative"
        style={{
          transform: bodyTransform,
          transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
      >
        {/* FRONT FACE (Just the two dot eyes) */}
        <div 
          className="absolute inset-0 flex items-start justify-center overflow-hidden shadow-xl"
          style={{ 
            backgroundColor: color,
            borderRadius: "60px 60px 20px 20px", // Tall pill/rectangle shape
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            paddingTop: "40px", // Eyes position from the top
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div className="flex gap-4">
             <div 
               className="w-3.5 h-3.5 bg-slate-900 rounded-full shadow-sm" 
               style={{ transform: getPupilsTransform(1), transition: "transform 0.25s ease-out" }} 
             />
             <div 
               className="w-3.5 h-3.5 bg-slate-900 rounded-full shadow-sm" 
               style={{ transform: getPupilsTransform(2), transition: "transform 0.15s ease-out" }} 
             />
          </div>
        </div>

        {/* BACK FACE (Solid Color) */}
        <div 
          className="absolute inset-0 shadow-xl"
          style={{
            backgroundColor: color,
            borderRadius: "60px 60px 20px 20px",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        />
       </div>
    </div>
  );
};

export default function LoginPage() {
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Interaction State
  const [focusState, setFocusState] = useState("none"); // "username", "password", "none"
  
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login(collegeId, password);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);

      router.push(`/dashboard/${res.data.user.role}`);
    } catch (err) {
      if (err.response?.data?.unverified) {
        router.push(`/verify-otp?email=${encodeURIComponent(err.response.data.email)}`);
      } else {
        setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.id !== "password") setFocusState("none");
    }, 50);
  };

  const handlePasswordBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.id !== "username") setFocusState("none");
    }, 50);
  };

  return (
    <div className="h-screen overflow-hidden flex text-slate-800 bg-white">

      {/* Left Marketing Side (Clustered Skyline Faces) */}
      <div className="flex-1 hidden lg:flex flex-col relative bg-gradient-to-br from-indigo-50 to-indigo-100/50 items-center justify-end px-12 pt-24 overflow-hidden">
        
        {/* Marketing Text Content over a frosted glass card */}
        <div className="max-w-2xl text-center relative z-20 mb-auto mt-8 bg-white/50 backdrop-blur-md border border-white shadow-2xl rounded-[3rem] p-10">
          <h1 className="text-5xl font-extrabold text-indigo-900 mb-6 leading-tight">
            The Future of <br/> Structured Learning.
          </h1>
          <p className="text-lg text-slate-700 font-medium">
            Access your courses, manage assignments, and evaluate submissions with ease on our Modern LMS.
          </p>
        </div>

        {/* The Blob Cluster matches the sketch! */}
        <div className="flex items-end justify-center relative z-10 w-full mt-10">
          <RectFace color="#6366f1" width={110} height={310} delay={0} zIndex={10} focusState={focusState} collegeId={collegeId} />
          <RectFace color="#ec4899" width={90} height={210} delay={40} zIndex={8} focusState={focusState} collegeId={collegeId} />
          <RectFace color="#10b981" width={80} height={180} delay={80} zIndex={12} focusState={focusState} collegeId={collegeId} />
          <RectFace color="#f59e0b" width={95} height={250} delay={120} zIndex={9} focusState={focusState} collegeId={collegeId} />
          <RectFace color="#8b5cf6" width={120} height={350} delay={160} zIndex={15} focusState={focusState} collegeId={collegeId} />
          <RectFace color="#06b6d4" width={100} height={290} delay={200} zIndex={7} focusState={focusState} collegeId={collegeId} />
        </div>
      </div>

      {/* Right Login Side (Clean Form UI) */}
      <div className="flex-1 flex flex-col justify-center px-12 sm:px-24 lg:px-32 xl:px-48 bg-white border-l border-slate-100 z-20 shadow-xl">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">EduDash.</h2>
          <p className="text-slate-500">Welcome back! Please enter your details.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">College ID</label>
            <input
              type="text"
              id="username"
              value={collegeId}
              onFocus={() => setFocusState("username")}
              onBlur={handleUsernameBlur}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              placeholder="e.g. 19BCE1024"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onFocus={() => setFocusState("password")}
              onBlur={handlePasswordBlur}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Entering Dashboard...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Register locally
          </Link>
        </p>
      </div>
    </div>
  );
}
