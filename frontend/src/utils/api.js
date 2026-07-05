import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Points to Spring Boot backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return Promise.reject(error);
        }

        // Call token refresh endpoint
        const response = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken: refreshToken,
        });

        const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
        
        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
        
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, perform logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
