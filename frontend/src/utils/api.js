import { API_BASE_URL } from '@env';

const apiRequest = async (endpoint, method = 'GET', data = null, queryParams = null) => {
  try {
    let url = `${API_BASE_URL}${endpoint}`;
    if (queryParams) {
      const params = new URLSearchParams(queryParams).toString();
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });

    let result;
    try {
      const text = await response.text();
      console.log(`Raw response from ${endpoint}:`, text);
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error(`Failed to parse JSON from ${endpoint}:`, e.message);
      result = { detail: text || 'Empty response' };
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      if (Array.isArray(result.detail)) {
        errorMessage = result.detail.map(err => err.msg).join('; ');
      } else if (result.detail) {
        errorMessage = result.detail;
      } else {
        errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error(`API error at ${endpoint}:`, error.message, { data, queryParams });
    throw new Error(`API error at ${endpoint}: ${error.message}`);
  }
};

export const createUser = async (userData) => {
  const response = await apiRequest('/users/', 'POST', userData);
  console.log('createUser response:', response);
  return response;
};

export const getOrCreateWorkout = async (userId) => {
  const response = await apiRequest('/workouts/current/', 'POST', { user_id: userId });
  console.log('getOrCreateWorkout response:', response);
  return response;
};

export const getWeeklyWorkout = (userId) => apiRequest(`/workouts/weekly/${userId}`);

export const getNutritionPlan = (userId) => apiRequest('/nutrition/plan/', 'POST', { user_id: userId });

export const saveDietaryPreferences = (userId, preferences) => apiRequest(`/users/${userId}/dietary-preferences`, 'POST', preferences);

export const getDietaryPreferences = (userId) => apiRequest(`/users/${userId}/dietary-preferences`);

export const submitFeedback = async (userId, feedbackData) => {
  const response = await apiRequest('/workouts/feedback/', 'POST', feedbackData, userId ? { user_id: userId } : null);
  console.log('submitFeedback response:', response);
  return response;
};

export const saveConversation = (conversationData) => apiRequest('/conversations/', 'POST', conversationData);