import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mouad12.pythonanywhere.com/api';

export const getPortfolio = () => {
  return axios.get(`${API_URL}/portfolio`);
};

export const login = (username, password) => {
  return axios.post(`${API_URL}/login`, { username, password });
};
