import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (collegeId, password) => {
    return api.post('/auth/login', { collegeId, password });
  },
  register: async (name, collegeId, email, password, role, department, isHOD) => {
    return api.post('/auth/register', { name, collegeId, email, password, role, department, isHOD });
  },
  verifyOTP: async (email, otp) => {
    return api.post('/auth/verify-otp', { email, otp });
  },
  promoteToHOD: async () => {
    return api.post('/auth/promote-to-hod');
  }
};

export const coursesAPI = {
  getMyCourses: async () => {
    return api.get('/courses/my');
  },
  getCourse: async (id) => {
    return api.get(`/courses/${id}`);
  },
  searchStudents: async (id, query) => {
    return api.get(`/courses/${id}/students/search?q=${query}`);
  },
  globalSearch: async (query) => {
    return api.get(`/courses/global/search?q=${encodeURIComponent(query)}`);
  },
  createCourse: async (courseData) => {
    return api.post('/courses', courseData);
  },
  getAllCourses: async () => {
    return api.get('/courses');
  },
  enrollInCourse: async (id) => {
    return api.post(`/courses/${id}/enroll`);
  },
  updateCourse: async (id, courseData) => {
    return api.put(`/courses/${id}`, courseData);
  }
};

export const assignmentsAPI = {
  getMyAssignments: async () => {
    return api.get('/courses/my/assignments');
  },
  getAssignments: async (courseId) => {
    return api.get(`/courses/${courseId}/lessons`);
  },
  createAssignment: async (courseId, formData) => {
    return api.post(`/courses/${courseId}/lessons`, formData);
  },
  submitAssignment: async (courseId, formData) => {
    return api.post(`/courses/${courseId}/submissions`, formData);
  },
  getSubmissions: async (courseId) => {
    return api.get(`/courses/${courseId}/submissions`);
  }
};

export const gradesAPI = {
  getCourseGrades: async (courseId) => {
    return api.get(`/courses/${courseId}/grades`);
  },
  exportGrades: async (courseId, template = false, format = 'csv') => {
    const params = new URLSearchParams();
    if (template) params.append('template', 'true');
    if (format) params.append('format', format);
    return api.get(`/courses/${courseId}/grades/export?${params.toString()}`, { responseType: 'blob' });
  },
  importGrades: async (courseId, formData) => {
    return api.post(`/courses/${courseId}/grades/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateComponents: async (courseId, studentId, components) => {
    return api.put(`/courses/${courseId}/grades/${studentId}/components`, components);
  },
  updateFinalGrade: async (courseId, studentId, finalGrade) => {
    return api.put(`/courses/${courseId}/grades/${studentId}/final`, { finalGrade });
  },
  publishGrades: async (courseId) => {
    return api.patch(`/courses/${courseId}/grades/publish`);
  }
};

export const placementAPI = {
  getPlacementRole: async () => {
    return api.get('/placement/me');
  },
  getPosts: async (query = "", tags = "", year = "") => {
    return api.get(`/placement/posts?q=${encodeURIComponent(query)}&tags=${encodeURIComponent(tags)}&year=${encodeURIComponent(year)}`);
  },
  getBookmarkedPosts: async () => {
    return api.get('/placement/posts/bookmarked');
  },
  getPostById: async (id) => {
    return api.get(`/placement/posts/${id}`);
  },
  createPost: async (postData) => {
    return api.post('/placement/posts', postData);
  },
  toggleUpvote: async (id) => {
    return api.post(`/placement/posts/${id}/upvote`);
  },
  toggleBookmark: async (id) => {
    return api.post(`/placement/posts/${id}/bookmark`);
  },
  getComments: async (postId) => {
    return api.get(`/placement/posts/${postId}/comments`);
  },
  addComment: async (postId, content, parentComment = null) => {
    return api.post(`/placement/posts/${postId}/comments`, { content, parentComment });
  },
  toggleCommentUpvote: async (commentId) => {
    return api.put(`/placement/comments/${commentId}/upvote`);
  }
};

export const userAPI = {
  getMe: async () => {
    return api.get('/users/me');
  },
  updateProfile: async (profileData) => {
    return api.put('/users/me', profileData);
  },
  updatePassword: async (oldPassword, newPassword) => {
    return api.put('/users/me/password', { oldPassword, newPassword });
  },
  getTranscript: async () => {
    return api.get('/users/me/transcript');
  },
  updateCRStatus: async (studentId, isCR) => {
    return api.put(`/users/${studentId}/cr`, { isCR });
  }
};

export const facultyAPI = {
  getProfile: async () => {
    return api.get('/users/me/faculty-profile');
  },
  updateProfile: async (profileData) => {
    return api.put('/users/me', profileData);
  },
  getCourseArchive: async () => {
    return api.get('/users/me/course-archive');
  },
  changePassword: async (oldPassword, newPassword) => {
    return api.put('/users/me/password', { oldPassword, newPassword });
  }
};

export const dsaAPI = {
  getQuestions: async () => {
    return api.get('/placement/dsa/questions');
  },
  addQuestion: async (questionData) => {
    return api.post('/placement/dsa/questions', questionData);
  },
  toggleCompletion: async (questionId) => {
    return api.post(`/placement/dsa/questions/${questionId}/toggle`);
  }
};

export const developmentAPI = {
  getQuestions: async () => {
    return api.get('/placement/development/questions');
  },
  addQuestion: async (questionData) => {
    return api.post('/placement/development/questions', questionData);
  },
  toggleCompletion: async (questionId) => {
    return api.post(`/placement/development/questions/${questionId}/toggle`);

  }
};

export const contestAPI = {
  getContests: async () => {
    return api.get('/placement/contests');
  },
  addContest: async (contestData) => {
    return api.post('/placement/contests', contestData);
  },
  getContestById: async (id) => {
    return api.get(`/placement/contests/${id}`);
  },
  addContestDiscussion: async (id, message) => {
    return api.post(`/placement/contests/${id}/discussion`, { message });
  },
  deleteContest: async (id) => {
    return api.delete(`/placement/contests/${id}`);
  }
};

export const mockOaAPI = {
  getOAs: async () => {
    return api.get('/placement/mock-oa');
  },
  addOA: async (oaData) => {
    return api.post('/placement/mock-oa', oaData);
  },
  uploadResults: async (id, studentsData) => {
    return api.put(`/placement/mock-oa/${id}/results`, studentsData);
  },
  deleteOA: async (id) => {
    return api.delete(`/placement/mock-oa/${id}`);
  }
};

export const alumniAPI = {
  // Post Retrieval
  getMyPosts: async () => api.get('/alumni/my-posts'),
  getAllTalks: async () => api.get('/alumni/talks'),
  getTalkById: async (id) => api.get(`/alumni/talks/${id}`),

  // Session
  createSession: async (data) => api.post('/alumni/session', data),
  getAllSessions: async () => api.get('/alumni/sessions'),
  registerForSession: async (id) => api.post(`/alumni/session/${id}/register`),

  // Create Talks
  createTedTalk: async (data) => api.post('/alumni/talks/ted-talk', data),
  createTechUpdate: async (data) => api.post('/alumni/talks/tech-update', data),

  // Engagement
  toggleLike: async (id) => api.post(`/alumni/talks/${id}/like`),
  addComment: async (id, text) => api.post(`/alumni/talks/${id}/comment`, { text }),

  // Delete
  deleteTalk: async (id) => api.delete(`/alumni/talks/${id}`),

  // TPC Review
  getPendingPosts: async () => api.get('/alumni/pending'),
  reviewTalk: async (id, status, rejectionReason) => api.patch(`/alumni/talks/${id}/review`, { status, rejectionReason }),
  reviewSession: async (id, status, rejectionReason) => api.patch(`/alumni/session/${id}/review`, { status, rejectionReason })
};

export const tpcAPI = {
  // HOD management
  getSeniors: () => api.get('/placement/tpc/seniors'),           // all seniors in dept
  toggleCoord: (userId) => api.put(`/placement/tpc/toggle/${userId}`) // toggle status
};

export const contestPerformanceAPI = {
  getPerformances: () => api.get('/contest-performance/me'),
  addPerformance: (data) => api.post('/contest-performance', data),
  deletePerformance: (id) => api.delete(`/contest-performance/${id}`)
};

export const taAPI = {
  getProfessorRequests: () => api.get('/ta-requests/professor/requests'),
  approveRequest: (requestId) => api.put(`/ta-requests/professor/requests/${requestId}/approve`)
};

export default api;