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
  fetch(`${API_BASE_URL}/api/v1/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ query })
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
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
      // SSE events are separated by double newlines (handle both \r\n and \n)
      const events = buffer.split(/\r?\n\r?\n/);
      
      // Keep the last partial chunk in the buffer
      buffer = events.pop() || "";
      
      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;
        
        // Parse individual SSE lines within this event block
        let dataStr = "";
        for (const line of eventBlock.split(/\r?\n/)) {
          if (line.startsWith("data:")) {
            // Accumulate data lines (strip "data:" or "data: " prefix)
            dataStr += line.slice(line.startsWith("data: ") ? 6 : 5);
          }
          // We ignore event:, id:, retry: lines since our event type is inside the data JSON
        }
        
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            onMessage(data.event, data);
          } catch (e) {
            console.error("Failed to parse SSE data", e, dataStr);
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
