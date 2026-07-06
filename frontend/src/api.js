import axios from 'axios';

// In production (Vercel), REACT_APP_BACKEND_URL = https://your-app.onrender.com
// In development, proxy in package.json forwards /api to localhost:8000
const BACKEND = process.env.REACT_APP_BACKEND_URL || '';
const API_BASE = `${BACKEND}/api`;

// WebSocket uses wss:// in production, ws:// in development
const WS_BASE = BACKEND
  ? BACKEND.replace('https://', 'wss://').replace('http://', 'ws://')
  : 'ws://localhost:8000';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  getDatasets:      ()               => axios.get(`${API_BASE}/datasets`),
  uploadDataset:    (nodesFile, edgesFile) => {
    const formData = new FormData();
    formData.append('nodes', nodesFile);
    if (edgesFile) formData.append('edges', edgesFile);
    return axios.post(`${API_BASE}/datasets/upload`, formData);
  },
  getAttacks:       ()               => axios.get(`${API_BASE}/attacks`),
  getDefenses:      ()               => axios.get(`${API_BASE}/defenses`),
  getExplainers:    ()               => axios.get(`${API_BASE}/explainers`),
  startRun:         (config)         => axios.post(`${API_BASE}/runs`, config),
  getRun:           (runId)          => axios.get(`${API_BASE}/runs/${runId}`),
  connectWebSocket: (runId) => {
    const token = localStorage.getItem('token');
    const url = `${WS_BASE}/api/ws/runs/${runId}${token ? `?token=${token}` : ''}`;
    return new WebSocket(url);
  },
  getExperiments:     (limit = 100, skip = 0) => axios.get(`${API_BASE}/experiments?limit=${limit}&skip=${skip}`),
  deleteExperiment:   (id)           => axios.delete(`${API_BASE}/experiments/${id}`),
  getExperimentStats: ()             => axios.get(`${API_BASE}/experiments/stats`),
};
