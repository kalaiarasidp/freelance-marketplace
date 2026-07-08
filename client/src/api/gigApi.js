import axiosInstance from './axiosInstance';

export const getGigs      = (params) => axiosInstance.get('/gigs', { params });
export const getGigById   = (id)     => axiosInstance.get(`/gigs/${id}`);
export const createGig    = (data)   => axiosInstance.post('/gigs', data);
export const updateGig    = (id, data) => axiosInstance.put(`/gigs/${id}`, data);
export const deleteGig    = (id)     => axiosInstance.delete(`/gigs/${id}`);
