"use client";

import { useState } from "react";
import { userAPI } from "@/lib/api";
import { Save, Lock, Mail, Link as LinkIcon, User, Briefcase } from "lucide-react";

export default function IdentitySettings({ user, setUser }) {
  const [formData, setFormData] = useState({
    bio: user.bio || "",
    targetRoles: (user.targetRoles || []).join(", ") || "",
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
    portfolio: user.socialLinks?.portfolio || "",
    emailNotifications: user.emailNotifications !== false
  });

  const hasProfileData = user.bio || (user.targetRoles && user.targetRoles.length > 0) || user.socialLinks?.linkedin;
  const [isEditingProfile, setIsEditingProfile] = useState(!hasProfileData);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);

  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        bio: formData.bio,
        targetRoles: formData.targetRoles.split(",").map(r => r.trim()).filter(r => r),
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio
        },
        emailNotifications: formData.emailNotifications
      };
      
      const res = await userAPI.updateProfile(payload);
      setUser(res.data.data);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      await userAPI.updatePassword(passwordData.oldPassword, passwordData.newPassword);
      alert("Password updated securely!");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Identity Update Form */}
      <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
        <h2 className="text-xl font-serif font-bold text-[#2d2a26] mb-6 uppercase tracking-widest border-b border-[#e6e2d8] pb-2 flex items-center gap-2">
          <User className="w-5 h-5 text-[#a99c85]" /> Profile Details
        </h2>

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#2d2a26] mb-1">About Me (Bio)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#8b9d83] focus:border-[#8b9d83] text-[#4a4744]"
                placeholder="A short bio about your academic journey..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2d2a26] mb-1 flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> Target Roles</label>
              <input
                type="text"
                value={formData.targetRoles}
                onChange={(e) => setFormData({ ...formData, targetRoles: e.target.value })}
                className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#8b9d83] focus:border-[#8b9d83] text-[#4a4744]"
                placeholder="e.g. SDE, Data Scientist, Product Manager (Comma separated)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1">GitHub / Portfolio</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="emailNotif"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                className="w-4 h-4 text-[#8b9d83] rounded border-[#e6e2d8]"
              />
              <label htmlFor="emailNotif" className="text-sm font-medium text-[#4a4744] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#736d65]" /> Send me email notifications for major updates.
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#2d2a26] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1816] transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {loading ? "Updating..." : "Save Identity"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="bg-white border border-[#e6e2d8] text-[#2d2a26] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#fcfbf9] transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#fcfbf9] p-5 rounded-xl border border-[#e6e2d8]">
                <h3 className="text-sm font-bold text-[#736d65] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> About Me
                </h3>
                <p className="text-[#2d2a26] whitespace-pre-wrap">{user.bio || "No bio added."}</p>
              </div>
              <div className="bg-[#fcfbf9] p-5 rounded-xl border border-[#e6e2d8]">
                <h3 className="text-sm font-bold text-[#736d65] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Target Roles
                </h3>
                <p className="text-[#2d2a26]">{(user.targetRoles || []).join(", ") || "None specified"}</p>
              </div>
              <div className="bg-[#fcfbf9] p-5 rounded-xl border border-[#e6e2d8]">
                <h3 className="text-sm font-bold text-[#736d65] uppercase tracking-widest mb-2">LinkedIn</h3>
                {user.socialLinks?.linkedin ? (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-[#8b9d83] hover:underline flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" /> {user.socialLinks.linkedin}
                  </a>
                ) : (
                  <p className="text-[#736d65]">-</p>
                )}
              </div>
              <div className="bg-[#fcfbf9] p-5 rounded-xl border border-[#e6e2d8]">
                <h3 className="text-sm font-bold text-[#736d65] uppercase tracking-widest mb-2">GitHub / Portfolio</h3>
                {user.socialLinks?.github || user.socialLinks?.portfolio ? (
                  <a href={user.socialLinks.github || user.socialLinks.portfolio} target="_blank" rel="noreferrer" className="text-[#8b9d83] hover:underline flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" /> {user.socialLinks.github || user.socialLinks.portfolio}
                  </a>
                ) : (
                  <p className="text-[#736d65]">-</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Update Form */}
      <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
        <div className="flex justify-between items-center mb-6 border-b border-[#e6e2d8] pb-2">
          <h2 className="text-xl font-serif font-bold text-[#2d2a26] uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#a99c85]" /> Security
          </h2>
          <button 
            type="button" 
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)} 
            className="text-sm font-bold text-[#8b9d83] hover:text-[#5a6b53] transition-colors bg-[#8b9d83]/10 px-4 py-1.5 rounded-md"
          >
            {showPasswordUpdate ? "Cancel" : "Update Password"}
          </button>
        </div>

        {showPasswordUpdate && (
          <form onSubmit={handlePasswordUpdate} className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2d2a26] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[#fcfbf9] border border-[#e6e2d8] rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={passLoading}
                className="bg-[#2d2a26] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1816] transition-colors shadow-sm flex items-center gap-2"
              >
                {passLoading ? "Updating..." : "Confirm New Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
