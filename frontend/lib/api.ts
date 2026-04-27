import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const invoiceApi = {
  getStats: () => api.get('/api/dashboard/stats'),
  getInvoices: () => api.get('/api/invoices'),
  createInvoice: (data: any) => api.post('/api/invoices', data),
  getInvoicePdf: (id: number) => `${API_BASE_URL}/api/invoices/${id}/pdf`,
  
  extractInvoice: (userInput: string) => api.post('/api/ai/extract', { user_input: userInput }),
  generateReminders: (params: any) => api.post('/api/ai/reminders', null, { params }),
  
  getClients: () => api.get('/api/clients'),
  createClient: (data: any) => api.post('/api/clients', data),
  
  getProfile: () => api.get('/api/settings/profile'),
  updateProfile: (data: any) => api.put('/api/settings/profile', data),
};

export default api;
