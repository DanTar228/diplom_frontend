import axios from 'axios';

const api = axios.create({
  baseURL: 'https://notescribe.ru:8000',
  headers :{
    'x-apikey': '59a7ad19f5a9fa0808f11931',
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  }
});

export const transcribeAudio = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploadfile/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin' : '*',
    },
  });
  
  return response.data;
};

export default api;
