"use client";

import { useState, useEffect, useRef } from "react";
import { gradesAPI } from "@/lib/api";
import { Download, Upload, Save, CheckCircle, Search, Edit3, X, FileText, AlertCircle, Settings } from "lucide-react";
import { coursesAPI } from "@/lib/api";

export default function GradesManager({ course, isPublished, onCourseUpdated, userRole = "professor" }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Edit states
  const [editComponents, setEditComponents] = useState({});
  const [editFinalGrade, setEditFinalGrade] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({ weights: {}, totalMarks: {} });
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (course?.courseId) {
      fetchGrades();
      setSettings({
        weights: course.weights || {},
        totalMarks: course.totalMarks || {}
      });
    }
  }, [course]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await gradesAPI.getCourseGrades(course.courseId);
      setGrades(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch grades", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const res = await gradesAPI.exportGrades(course.courseId, false, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.courseId}_Grades.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export grades");
    }
  };

  const handleExportTemplate = async (format = 'csv') => {
    try {
      const res = await gradesAPI.exportGrades(course.courseId, true, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.courseId}_Grades_Template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Template export failed", error);
      alert("Failed to export template");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await gradesAPI.importGrades(course.courseId, formData);
      alert("Grades imported successfully. Scores recalculated!");
      fetchGrades();
    } catch (error) {
      console.error("Import failed", error);
      alert(error.response?.data?.message || "Failed to import grades");
      setLoading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handlePublish = async () => {
    if (confirm("Are you sure you want to publish final grades to all students? They will be able to see them immediately.")) {
      try {
        setPublishing(true);
        await gradesAPI.publishGrades(course.courseId);
        alert("Grades successfully published!");
        if (onCourseUpdated) onCourseUpdated();
      } catch (error) {
        console.error("Publish failed", error);
        alert(error.response?.data?.message || "Failed to publish grades");
      } finally {
        setPublishing(false);
      }
    }
  };

  const openEditModal = (grade) => {
    setSelectedGrade(grade);
    setEditComponents({
      quiz1: grade.components?.quiz1 ?? "",
      quiz2: grade.components?.quiz2 ?? "",
      midsem: grade.components?.midsem ?? "",
      endsem: grade.components?.endsem ?? "",
      project: grade.components?.project ?? "",
      misc: grade.components?.misc ?? ""
    });
    setEditFinalGrade(grade.finalGrade || "");
    setShowEditModal(true);
  };

  const handleSaveGrades = async () => {
    try {
      setSavingGrade(true);
      // Validate and clean components
      const payload = {};
      Object.keys(editComponents).forEach(key => {
        if (editComponents[key] !== "") {
          payload[key] = Number(editComponents[key]);
        }
      });

      // 1. Update Components
      if (Object.keys(payload).length > 0) {
        await gradesAPI.updateComponents(course.courseId, selectedGrade.student._id, payload);
      }

      // 2. Update Final Grade if changed (only for Professors)
      if (userRole === "professor" && editFinalGrade !== selectedGrade.finalGrade) {
        await gradesAPI.updateFinalGrade(course.courseId, selectedGrade.student._id, editFinalGrade || null);
      }

      alert("Grade updated successfully!");
      setShowEditModal(false);
      fetchGrades();
    } catch (error) {
      console.error("Failed to update grade", error);
      alert(error.response?.data?.message || "Failed to update grade");
    } finally {
      setSavingGrade(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
       await coursesAPI.updateCourse(course.courseId, { weights: settings.weights, totalMarks: settings.totalMarks });
       alert("Grading settings updated successfully.");
       setShowSettingsModal(false);
       if (onCourseUpdated) onCourseUpdated();
    } catch (error) {
       console.error(error);
       alert("Failed to update settings");
    } finally {
       setSavingSettings(false);
    }
  };

  const openAuditModal = (grade) => {
    setSelectedGrade(grade);
    setShowAuditModal(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Gradebook
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage, calculate and publish student grades</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {userRole === "professor" && (
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs font-medium"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              Config
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs font-medium"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".csv,.xlsx" 
          />

          <div className="flex border border-indigo-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => handleExportTemplate('xlsx')}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-bold border-r border-indigo-100"
              title="Download Template as Excel"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              Template (XLSX)
            </button>
            <button 
              onClick={() => handleExportTemplate('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-medium"
              title="Download Template as CSV"
            >
              CSV
            </button>
          </div>

          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => handleExport('xlsx')}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold border-r border-slate-200"
              title="Export Grades as Excel"
            >
              <Download className="w-4 h-4 text-blue-600" />
              Export (XLSX)
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              title="Export Grades as CSV"
            >
              CSV
            </button>
          </div>

          {userRole === "professor" && (
            <button 
              onClick={handlePublish}
              disabled={publishing || grades.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {publishing ? "Publishing..." : "Publish Final Grades"}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
        ) : grades.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No grades found for this course.</p>
            <p className="text-sm mt-1">Students must enroll first, or you can import a CSV.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Student</th>
                <th className="p-4 font-semibold border-b">Quiz 1</th>
                <th className="p-4 font-semibold border-b">Quiz 2</th>
                <th className="p-4 font-semibold border-b">Midsem</th>
                <th className="p-4 font-semibold border-b">Endsem</th>
                <th className="p-4 font-semibold border-b">Project</th>
                <th className="p-4 font-semibold border-b">Misc</th>
                <th className="p-4 font-semibold border-b bg-indigo-50 text-indigo-800">Final Score</th>
                <th className="p-4 font-semibold border-b bg-emerald-50 text-emerald-800">Final Grade</th>
                <th className="p-4 font-semibold border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((grade) => (
                <tr key={grade._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{grade.student?.name}</div>
                    <div className="text-xs text-slate-500">{grade.student?.collegeId}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.quiz1 ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.quiz2 ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.midsem ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.endsem ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.project ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{grade.components?.misc ?? "-"}</td>
                  <td className="p-4 text-sm font-bold text-indigo-600 bg-indigo-50/30">
                    {grade.finalScore !== null ? grade.finalScore.toFixed(2) : "-"}
                  </td>
                  <td className="p-4 text-sm font-bold text-emerald-600 bg-emerald-50/30">
                    {grade.finalGrade || "-"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openAuditModal(grade)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Audit Log"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditModal(grade)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Grades"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedGrade && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Edit Grades Form
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="font-medium text-indigo-900">{selectedGrade.student?.name}</p>
                <p className="text-sm text-indigo-700">{selectedGrade.student?.collegeId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.keys(editComponents).map(key => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">{key}</label>
                    <input 
                      type="number" 
                      value={editComponents[key]}
                      onChange={(e) => setEditComponents({...editComponents, [key]: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                      placeholder="0 - 100"
                    />
                  </div>
                ))}
              </div>

              {userRole === "professor" && (
                <div className="border-t border-slate-100 pt-6 mb-6">
                  <label className="block text-sm font-semibold text-emerald-800 uppercase mb-2">Official Final Grade (Letter)</label>
                  <input 
                    type="text" 
                    value={editFinalGrade}
                    onChange={(e) => setEditFinalGrade(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-emerald-700 uppercase"
                    placeholder="e.g. A+, A, B, C..."
                    maxLength={2}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveGrades}
                  disabled={savingGrade}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingGrade ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && selectedGrade && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" /> Grade Audit Log
              </h3>
              <button 
                onClick={() => setShowAuditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{selectedGrade.student?.name}</p>
                  <p className="text-sm text-slate-500">{selectedGrade.student?.collegeId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Current Final Grade</p>
                  <p className="text-2xl font-black text-emerald-600">{selectedGrade.finalGrade || "-"}</p>
                </div>
              </div>

              {selectedGrade.auditLog?.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border border-dashed rounded-xl">
                  No changes have been recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedGrade.auditLog?.map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 bg-white inline-block px-2 py-0.5 rounded border border-slate-200 mb-2">
                          <span className="capitalize text-indigo-600">{log.role}</span>
                        </p>
                        <p className="text-slate-700 font-medium">{log.action}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" /> Grade Configurations
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm mb-6 shadow-sm border border-indigo-100">
                Configure the maximum possible marks for each evaluation and its final weightage (%). Example: Midsem out of 50 marks, but carries 30% of final grade.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Total Marks Column */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2 pb-2 border-b">
                     Total Marks
                  </h4>
                  {["quiz1", "quiz2", "midsem", "endsem", "project", "misc"].map(key => (
                     <div key={`tm-${key}`}>
                       <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{key}</label>
                       <input 
                         type="number"
                         value={settings.totalMarks[key] || ""}
                         onChange={(e) => setSettings({...settings, totalMarks: {...settings.totalMarks, [key]: Number(e.target.value)}})}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                     </div>
                  ))}
                </div>

                {/* Weightage Column */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2 pb-2 border-b">
                     Weightage (%)
                  </h4>
                  {["quiz1", "quiz2", "midsem", "endsem", "project", "misc"].map(key => (
                     <div key={`wt-${key}`}>
                       <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{key} weight</label>
                       <input 
                         type="number"
                         value={settings.weights[key] || ""}
                         onChange={(e) => setSettings({...settings, weights: {...settings.weights, [key]: Number(e.target.value)}})}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                     </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
