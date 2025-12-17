import axios from 'axios';

const API_BASE = '/api';

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Datasets
  getDatasets: () => axios.get(`${API_BASE}/datasets`),
  uploadDataset: (nodesFile, edgesFile) => {
    const formData = new FormData();
    formData.append('nodes', nodesFile);
    if (edgesFile) {
      formData.append('edges', edgesFile);
    }
    return axios.post(`${API_BASE}/datasets/upload`, formData);
  },

  // Components
  getAttacks: () => axios.get(`${API_BASE}/attacks`),
  getDefenses: () => axios.get(`${API_BASE}/defenses`),
  getExplainers: () => axios.get(`${API_BASE}/explainers`),

  // Runs (requires authentication)
  startRun: (config) => axios.post(`${API_BASE}/runs`, config),
  getRun: (runId) => axios.get(`${API_BASE}/runs/${runId}`),

  // WebSocket (requires authentication)
  connectWebSocket: (runId) => {
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8000${API_BASE}/ws/runs/${runId}${token ? `?token=${token}` : ''}`;
    return new WebSocket(wsUrl);
  },

  // Experiments
  getExperiments: (limit = 100, skip = 0) => axios.get(`${API_BASE}/experiments?limit=${limit}&skip=${skip}`),
  deleteExperiment: (experimentId) => axios.delete(`${API_BASE}/experiments/${experimentId}`),
  getExperimentStats: () => axios.get(`${API_BASE}/experiments/stats`)
};