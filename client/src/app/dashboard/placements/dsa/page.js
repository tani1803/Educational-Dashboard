"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { dsaAPI, placementAPI } from "@/lib/api";
import { ChevronRight, PlayCircle, Code, PlusCircle, CheckCircle, Circle, MapPin, X, ExternalLink, Video } from "lucide-react";
import Link from "next/link";

const ROADMAP_STEPS = [
  {
    step: 1,
    title: "Basic C++",
    description: "Learn variables, loops, functions, and basics of C++.",
    videos: [
       { title: "Basic C++ Tutorial", link: "https://www.youtube.com/watch?v=EAR7De6Goz4" }
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    step: 2,
    title: "STL in C++",
    description: "Master the Standard Template Library: Vectors, Maps, Sets, etc.",
    videos: [
       { title: "C++ STL Full Course", link: "https://www.youtube.com/watch?v=JUp_6L12l1U" }
    ],
    color: "from-indigo-500 to-purple-500"
  },
  {
    step: 3,
    title: "Stack and Queue",
    description: "Understand LIFO and FIFO structures, implementations, and famous problems.",
    videos: [
       { title: "Stack and Queue Playlist (Striver)", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0pOd5zvVVSZ38QqNYBaVn6P" }
    ],
    color: "from-violet-500 to-fuchsia-500"
  },
  {
    step: 4,
    title: "Recursion & DP",
    description: "Dive deep into recursion and Dynamic Programming.",
    videos: [
       { title: "Recursion Playlist", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY" }
    ],
    color: "from-fuchsia-500 to-pink-500"
  },
  {
    step: 5,
    title: "Graphs",
    description: "Traversals, Shortest Paths, MST, and advanced graph algorithms.",
    videos: [
       { title: "Graphs Series", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3gA41TKO2H5bHpPd7fzn" }
    ],
    color: "from-orange-500 to-red-500"
  },
  {
    step: 6,
    title: "Linked Lists & Trees",
    description: "Pointers, node manipulations, BSTs, and tree traversals.",
    videos: [
       { title: "Linked Lists & Trees Playlist", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk" }
    ],
    color: "from-emerald-500 to-teal-500"
  }
];

export default function DSARoadmap() {
  const [questions, setQuestions] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [placementRole, setPlacementRole] = useState("student");
  
  // Modal states
  const [activeStep, setActiveStep] = useState(null); // Practice Tasks Modal
  const [activeVideoStep, setActiveVideoStep] = useState(null); // Video Tutorial Modal
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", link: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchRole();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dsaAPI.getQuestions();
      if (res.data?.data) {
        setQuestions(res.data.data.questions || []);
        
        const completedMapTemp = {};
        res.data.data.completedQuestions.forEach(id => {
          completedMapTemp[id] = true;
        });
        setCompletedMap(completedMapTemp);
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRole = async () => {
    try {
      const res = await placementAPI.getPlacementRole();
      if (res.data?.data?.placementRole) {
        setPlacementRole(res.data.data.placementRole);
      }
    } catch (err) {
      console.error("Failed to fetch placement role", err);
    }
  };

  const handleToggle = async (questionId) => {
    setCompletedMap(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    try {
      await dsaAPI.toggleCompletion(questionId);
    } catch (err) {
      console.error(err);
      setCompletedMap(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!activeStep || !newQuestion.title || !newQuestion.link) return;
    
    setIsSubmitting(true);
    try {
      await dsaAPI.addQuestion({
        step: activeStep.step,
        questionTitle: newQuestion.title,
        questionLink: newQuestion.link
      });
      setShowAddModal(false);
      setNewQuestion({ title: "", link: "" });
      fetchData(); // refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to add question. Only Seniors can add questions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get questions for active step
  const stepQuestions = activeStep ? questions.filter(q => q.step === activeStep.step) : [];
  const totalStepQuestions = stepQuestions.length;
  const completedStepQuestions = stepQuestions.filter(q => completedMap[q._id]).length;
  const progressPercent = totalStepQuestions === 0 ? 0 : Math.round((completedStepQuestions / totalStepQuestions) * 100);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
           <Link href="/dashboard/placements" className="hover:text-indigo-600">Placements</Link>
           <ChevronRight className="w-4 h-4" />
           <span className="text-slate-800 font-medium">DSA Roadmap</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-indigo-600" /> DSA Learning Roadmap
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl">Follow this step-by-step roadmap tailored for your Data Structures and Algorithms journey. Watch the curated theory videos and practice the questions added by your seniors.</p>
      </div>

      {loading && questions.length === 0 ? (
        <div className="flex justify-center my-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-1/2 top-10 bottom-10 w-2 ml-[-1px] bg-indigo-50 hidden lg:block rounded-full"></div>
          
          <div className="relative z-10 flex flex-col gap-8">
            {ROADMAP_STEPS.map((stepItem, index) => {
              const qCount = questions.filter(q => q.step === stepItem.step).length;
              const isEven = index % 2 === 1;
              
              return (
                <div key={stepItem.step} className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`w-full lg:w-1/2 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                    <div className="w-full lg:max-w-md bg-white border border-slate-100 shadow-lg shadow-indigo-100/20 rounded-2xl p-6 relative group transition-transform hover:-translate-y-1">
                      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stepItem.color} rounded-t-2xl`}></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${stepItem.color}`}>
                          Step {stepItem.step}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">{qCount} Questions</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{stepItem.title}</h3>
                      <p className="text-sm text-slate-500 mb-6">{stepItem.description}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                         <button 
                          onClick={() => setActiveVideoStep(stepItem)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors">
                           <PlayCircle className="w-4 h-4" /> Watch Tutorials
                         </button>
                         <button 
                          onClick={() => setActiveStep(stepItem)}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors">
                           <Code className="w-4 h-4" /> Practice Questions
                         </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-indigo-100 shadow-xl z-20">
                     <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${stepItem.color}`}>
                        {stepItem.step}
                     </span>
                  </div>
                  <div className="hidden lg:block lg:w-1/2"></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideoStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className={`p-6 text-white bg-gradient-to-r ${activeVideoStep.color} flex justify-between items-center`}>
               <div>
                  <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1 block">Step {activeVideoStep.step} Media</span>
                  <h2 className="text-xl font-bold">Recommended Tutorials</h2>
               </div>
               <button onClick={() => setActiveVideoStep(null)} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 flex-1 bg-slate-50">
               <p className="text-slate-600 text-sm mb-6">Choose a tutorial resource below to learn about <strong>{activeVideoStep.title}</strong>.</p>
               <div className="space-y-3">
                 {activeVideoStep.videos.map((vid, i) => (
                   <a key={i} href={vid.link} target="_blank" rel="noopener noreferrer" className="flex items-center group p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                         <PlayCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800 text-sm">{vid.title}</h4>
                         <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">YouTube <ExternalLink className="w-3 h-3" /></span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                   </a>
                 ))}
               </div>
               <button onClick={() => setActiveVideoStep(null)} className="mt-6 w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {activeStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className={`p-6 text-white bg-gradient-to-r ${activeStep.color} flex justify-between items-center`}>
               <div>
                  <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1 block">Step {activeStep.step} Practice</span>
                  <h2 className="text-2xl font-bold">{activeStep.title}</h2>
               </div>
               <button onClick={() => setActiveStep(null)} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              <div className="flex justify-between items-end mb-6">
                 <div>
                   <h3 className="text-lg font-bold text-slate-800">Assigned Questions</h3>
                   <p className="text-sm text-slate-500">Solve these problems to master this topic.</p>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{progressPercent}%</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completed</div>
                 </div>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full mb-8 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${activeStep.color} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
              </div>

              {stepQuestions.length === 0 ? (
                 <div className="text-center py-12 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-slate-800 font-medium">No questions yet</h4>
                    <p className="text-slate-500 text-sm mt-1">Seniors haven't added questions for this section yet.</p>
                 </div>
              ) : (
                <div className="space-y-3">
                  {stepQuestions.map((q) => {
                    const isDone = completedMap[q._id];
                    return (
                      <div key={q._id} className={`bg-white p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:shadow-md ${isDone ? 'border-green-200 bg-green-50/50' : 'border-slate-100 shadow-sm'}`}>
                         <div className="flex items-center gap-4 flex-1">
                            <button 
                              onClick={() => handleToggle(q._id)} 
                              className={`flex-shrink-0 transition-colors ${isDone ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
                            >
                               {isDone ? <CheckCircle className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                            </button>
                            <div>
                               <a href={q.questionLink} target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline line-clamp-1 ${isDone ? 'text-green-800' : 'text-slate-800'}`}>
                                 {q.questionTitle}
                               </a>
                               <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                 Added by {q.addedBy?.name || 'Anonymous'} <span className="opacity-50 mx-1">•</span> <ExternalLink className="w-3 h-3" /> External Link
                               </p>
                            </div>
                         </div>
                         <a href={q.questionLink} target="_blank" rel="noopener noreferrer" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDone ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            Solve
                         </a>
                      </div>
                    )
                  })}
                </div>
              )}
              
              {placementRole === "senior" && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                   {!showAddModal ? (
                      <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        <PlusCircle className="w-5 h-5" /> Add New Practice Question
                      </button>
                   ) : (
                      <form onSubmit={handleAddSubmit} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-md">
                         <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Add a new question</h4>
                         
                         <div className="space-y-4">
                            <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Question Title / Name</label>
                               <input type="text" required value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} placeholder="e.g. Two Sum (Leetcode)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                            </div>
                            <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Platform Link (Leetcode, GFG, etc)</label>
                               <input type="url" required value={newQuestion.link} onChange={e => setNewQuestion({...newQuestion, link: e.target.value})} placeholder="https://leetcode.com/problems/..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                            </div>
                         </div>
                         
                         <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm">
                               {isSubmitting ? "Adding..." : "Submit Question"}
                            </button>
                         </div>
                      </form>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
