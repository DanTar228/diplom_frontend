import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers :{
     'x-apikey': '59a7ad19f5a9fa0808f11931',
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
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
export const apiStatusRequest = async ()=>{
  const start = performance.now()
  const response = await api.get('/api_status/',{
    headers: {
      'Access-Control-Allow-Origin' : '*',
    },
  })
  const end = performance.now()
  const ping = end -start  
  return {"status_code" : response.data.status_code, "ping":Math.round(ping)}
}

export default api;
