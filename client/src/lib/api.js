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
  register: async (name, collegeId, email, password, role) => {
    return api.post('/auth/register', { name, collegeId, email, password, role });
  },
  verifyOTP: async (email, otp) => {
    return api.post('/auth/verify-otp', { email, otp });
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
  }
};

export const assignmentsAPI = {
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

<<<<<<< HEAD
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
=======
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
>>>>>>> b2d828765c569d74dc1e63fe0ec2b29ca6050e2d
  }
};

export default api;
