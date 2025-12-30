import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
