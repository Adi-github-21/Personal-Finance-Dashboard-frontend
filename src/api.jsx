import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor: Har outgoing request mein JWT token add karega
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) { // Agar token localStorage mein hai
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`; // Header mein add karo
  }
  return req;
});

export default API; // API instance ko export kar rahe hain
