const API_BASE_URL = 'http://localhost:8000/api';

// Search and Retrieve APIs
export const searchItem = async ({ itemId }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?itemId=${itemId}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const retrieveItem = async ({ itemId, userId, timestamp }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: parseInt(itemId),
        userId: userId,
        timestamp
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Logs API
export const getLogs = async (startDate, endDate, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      ...(filters.itemId && { item_id: filters.itemId }),
      ...(filters.userId && { user_id: filters.userId }),
      ...(filters.actionType && { action_type: filters.actionType })
    });

    const response = await fetch(`${API_BASE_URL}/logs?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Placement API
export const placeItem = async (placementData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(placementData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Time Simulation API
export const runSimulation = async (simulationParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulation/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simulationParams),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Waste Management APIs
export const getWasteItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/waste/items`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const generateReturnPlan = async (returnPlanRequest) => {
  try {
    const response = await fetch(`${API_BASE_URL}/waste/return-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(returnPlanRequest),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Import/Export APIs
export const importItems = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/import/items`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const importContainers = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/import/containers`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const exportArrangement = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/export/arrangement`);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'cargo_arrangement.csv';
    
    // Get the blob data
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 