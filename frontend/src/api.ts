import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_URL,
});

export const createRFP = async (text: string) => {
    const response = await api.post('/rfps', { text });
    return response.data;
};

export const getRFPs = async () => {
    const response = await api.get('/rfps');
    return response.data;
};

export const getRFP = async (id: string) => {
    const response = await api.get(`/rfps/${id}`);
    return response.data;
};

export const getComparison = async (id: string) => {
    const response = await api.get(`/rfps/${id}/compare`);
    return response.data;
}

export const createVendor = async (data: any) => {
    const response = await api.post('/vendors', data);
    return response.data;
};

export const getVendors = async () => {
    const response = await api.get('/vendors');
    return response.data;
};
