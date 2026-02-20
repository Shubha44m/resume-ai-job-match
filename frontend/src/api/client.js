import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://resume-ai-job-match.onrender.com';

const api = axios.create({
    baseURL: API_BASE,
});

export const analyzeResume = async ({ resumeFile, resumeText, jobDescription }) => {
    const formData = new FormData();
    if (resumeFile) formData.append('resume', resumeFile);
    if (resumeText) formData.append('resume_text', resumeText);
    formData.append('job_description', jobDescription);
    const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const getHistory = async (page = 1, perPage = 10) => {
    const { data } = await api.get('/history', { params: { page, per_page: perPage } });
    return data;
};

export const getAnalysis = async (id) => {
    const { data } = await api.get(`/history/${id}`);
    return data;
};

export const deleteAnalysis = async (id) => {
    const { data } = await api.delete(`/history/${id}`);
    return data;
};

export default api;
