"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { developmentAPI, placementAPI } from "@/lib/api";
import { ChevronRight, PlayCircle, Code, PlusCircle, CheckCircle, Circle, MapPin, X, ExternalLink } from "lucide-react";
import Link from "next/link";

const ROADMAP_STEPS = [
  {
    step: 1,
    title: "HTML Foundation",
    description: "Learn the basic skeleton of the web: tags, attributes, and semantic HTML.",
    videos: [
       { title: "HTML Crash Course", link: "https://www.youtube.com/watch?v=k2DSi1zGEc8" }
    ],
    color: "from-orange-400 to-amber-500"
  },
  {
    step: 2,
    title: "CSS Styling",
    description: "Master layouts, colors, flexbox, and responsive design.",
    videos: [
       { title: "CSS Crash Course", link: "https://www.youtube.com/watch?v=ESnrn1kAD4E" }
    ],
    color: "from-blue-400 to-cyan-500"
  },
  {
    step: 3,
    title: "Basic JavaScript",
    description: "Dive into logic, DOM manipulation, arrays, and functions.",
    videos: [
       { title: "JS Full Course (Part 1)", link: "https://www.youtube.com/watch?v=a-wVHL0lpb0&t=19350s" },
       { title: "JS Full Course (Part 2)", link: "https://www.youtube.com/watch?v=1aR7tcmWo_w&t=9s" }
    ],
    color: "from-yellow-400 to-amber-500"
  },
  {
    step: 4,
    title: "Basic Frontend Projects",
    description: "Build structured projects to solidify your HTML, CSS, and JS logic.",
    videos: [
       { title: "Basic Project 1", link: "https://www.youtube.com/watch?v=2aHJ-MKY1b0&t=113s" },
       { title: "Basic Project 2", link: "https://www.youtube.com/watch?v=2aHJ-MKY1b0&t=113s" }
    ],
    color: "from-green-400 to-emerald-500"
  },
  {
    step: 5,
    title: "Node.js, Express & Auth",
    description: "Set up servers, route requests and manage user authentication via Piyush Garg's tutorials.",
    videos: [
       { title: "Node.js & Express Auth", link: "https://www.youtube.com/watch?v=pkKn8q5AvsY&t=50s" }
    ],
    color: "from-teal-500 to-green-600"
  },
  {
    step: 6,
    title: "Basic Backend Project",
    description: "Connect your backend APIs with a real database and perform CRUD.",
    videos: [
       { title: "Backend Project Tutorial", link: "https://www.youtube.com/watch?v=NQOAQP0mow0&t=1927s" }
    ],
    color: "from-slate-600 to-gray-800"
  },
  {
    step: 7,
    title: "React.js",
    description: "State management, components, hooks, and modern frontend frameworks.",
    videos: [
       { title: "React.js Crash Course", link: "https://www.youtube.com/watch?v=qrrIbNmBWVI" }
    ],
    color: "from-cyan-400 to-blue-600"
  },
  {
    step: 8,
    title: "Docker & AWS",
    description: "Containerize your applications and deploy them to the cloud securely.",
    videos: [
       { title: "Docker & AWS Guide", link: "https://www.youtube.com/watch?v=Uf6PXnagtsg" }
    ],
    color: "from-blue-600 to-indigo-700"
  }
];

export default function DevRoadmap() {
  const [questions, setQuestions] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [placementRole, setPlacementRole] = useState("student");
  
  // Modal states
  const [activeStep, setActiveStep] = useState(null); // Practice Tasks
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
      const res = await developmentAPI.getQuestions();
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
      await developmentAPI.toggleCompletion(questionId);
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
      await developmentAPI.addQuestion({
        step: activeStep.step,
        questionTitle: newQuestion.title,
        questionLink: newQuestion.link
      });
      setShowAddModal(false);
      setNewQuestion({ title: "", link: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add component. Only Seniors can add components.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
           <span className="text-slate-800 font-medium">Development Roadmap</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-cyan-500" /> Web Development Roadmap
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl">Follow this structured path to master Full-Stack Web Development. Watch these curated videos and complete project exercises added by your seniors.</p>
      </div>

      {loading && questions.length === 0 ? (
        <div className="flex justify-center my-20"><div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-1/2 top-10 bottom-10 w-2 ml-[-1px] bg-slate-50 hidden lg:block rounded-full"></div>
          
          <div className="relative z-10 flex flex-col gap-8 md:gap-12">
            {ROADMAP_STEPS.map((stepItem, index) => {
              const qCount = questions.filter(q => q.step === stepItem.step).length;
              const isEven = index % 2 === 1;
              
              return (
                <div key={stepItem.step} className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`w-full lg:w-1/2 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                    <div className="w-full lg:max-w-md bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl p-6 relative group transition-transform hover:-translate-y-1">
                      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stepItem.color} rounded-t-2xl`}></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white bg-gradient-to-r ${stepItem.color}`}>
                          MODULE {stepItem.step}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{qCount} Tasks</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{stepItem.title}</h3>
                      <p className="text-sm text-slate-600 mb-6">{stepItem.description}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                         <button 
                          onClick={() => setActiveVideoStep(stepItem)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors">
                           <PlayCircle className="w-4 h-4" /> Watch Tutorials
                         </button>
                         <button 
                          onClick={() => setActiveStep(stepItem)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors">
                           <Code className="w-4 h-4" /> Practice Tasks
                         </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-slate-100 shadow-lg z-20">
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
                  <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1 block">Module {activeVideoStep.step} Media</span>
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
                   <a key={i} href={vid.link} target="_blank" rel="noopener noreferrer" className="flex items-center group p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                         <PlayCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800 text-sm">{vid.title}</h4>
                         <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">YouTube <ExternalLink className="w-3 h-3" /></span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800" />
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
                  <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1 block">Module {activeStep.step} Practice</span>
                  <h2 className="text-2xl font-bold">{activeStep.title}</h2>
               </div>
               <button onClick={() => setActiveStep(null)} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              <div className="flex justify-between items-end mb-6">
                 <div>
                   <h3 className="text-lg font-bold text-slate-800">Assigned Tasks</h3>
                   <p className="text-sm text-slate-500">Build these micro-projects to master the module.</p>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{progressPercent}%</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completed</div>
                 </div>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full mb-8 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${activeStep.color} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
              </div>

              {stepQuestions.length === 0 ? (
                 <div className="text-center py-12 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-slate-800 font-medium">No tasks yet</h4>
                    <p className="text-slate-500 text-sm mt-1">Seniors haven't added practice tasks for this module yet.</p>
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
                            Build
                         </a>
                      </div>
                    )
                  })}
                </div>
              )}
              
               {placementRole === "senior" && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                   {!showAddModal ? (
                      <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:border-slate-400 hover:text-slate-700 transition-colors">
                        <PlusCircle className="w-5 h-5" /> Add New Practice Task
                      </button>
                   ) : (
                      <form onSubmit={handleAddSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
                         <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Add a new task</h4>
                         
                         <div className="space-y-4">
                            <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Task Name</label>
                               <input type="text" required value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} placeholder="e.g. Build a Portfolio layout" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm" />
                            </div>
                            <div>
                               <label className="text-xs font-semibold text-slate-500 mb-1 block">Reference Link (Figma, GitHub, CodeSandbox)</label>
                               <input type="url" required value={newQuestion.link} onChange={e => setNewQuestion({...newQuestion, link: e.target.value})} placeholder="https://..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm" />
                            </div>
                         </div>
                         
                         <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold flex justify-center items-center gap-2 hover:bg-slate-900 disabled:opacity-50 transition-colors text-sm">
                               {isSubmitting ? "Adding..." : "Submit Task"}
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
