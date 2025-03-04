interface ModelGenerationResponse {
  success: boolean;
  jobId: string;
  status: string;
  message: string;
  statusUrl: string;
}

interface JobStatusResponse {
  status: string;
  progress?: number;
  message?: string;
  model_url?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
}

export async function generateModel(formData: FormData): Promise<ModelGenerationResponse> {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/models/generate`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  return response.json();
}

export async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/models/status/${jobId}`, {
    headers: headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check job status');
  }

  return response.json();
} 