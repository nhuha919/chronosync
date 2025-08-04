import axios from 'axios';

export const register = async (data) => axios.post(`/api/auth/register`, data);
export const login = async (data) => axios.post(`/api/auth/login`, data);
export const googleLogin = async (idToken) => axios.post(`/api/auth/google-login`, idToken);