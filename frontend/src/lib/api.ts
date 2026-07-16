import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const planTrip = async (query: string) => {
  const response = await api.post('/plan', { query });
  return response.data;
};

export const planTripStream = (
  query: string, 
  onMessage: (event: string, data: any) => void, 
  onError: (error: any) => void,
  onComplete: () => void
) => {
  // Using native fetch API to handle SSE since axios doesn't support EventSource directly easily
  // We'll POST the query and the backend returns text/event-stream
  fetch(`${API_BASE_URL}/api/v1/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ query })
  }).then(async (response) => {
    if (!response.body) throw new Error("No response body");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onComplete();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      
      // Keep the last partial chunk in the buffer
      buffer = lines.pop() || "";
      
      for (const chunk of lines) {
        if (chunk.startsWith("data: ")) {
          try {
            const dataStr = chunk.slice(6);
            const data = JSON.parse(dataStr);
            onMessage(data.event, data);
          } catch (e) {
            console.error("Failed to parse SSE chunk", e);
          }
        }
      }
    }
  }).catch(error => {
    onError(error);
  });
};


export const transcribeAudio = async (audioBase64: string) => {
  const response = await api.post('/transcribe', { audio_base64: audioBase64 });
  return response.data;
};

export default api;
