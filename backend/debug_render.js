const axios = require('axios');

const BASE_URL = 'https://ai-powered-interview-preparation-app-vif4.onrender.com';

async function debug() {
  try {
    // 1. Register a test user
    const email = `testuser_${Date.now()}@test.com`;
    console.log('Registering user:', email);
    const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: email,
      password: 'Password123!',
    });
    const token = registerRes.data.token;
    console.log('Got token:', token);

    // 2. Create a session
    console.log('Creating session...');
    const sessionRes = await axios.post(`${BASE_URL}/api/sessions/create`, {
      title: 'Test Session',
      role: 'Engineer',
      experience: 'Junior'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => {
      // It might be the interview-sessions endpoint!
      return axios.post(`${BASE_URL}/api/interview-sessions`, {
        company: 'TestCorp',
        type: 'technical',
        difficulty: 'medium',
        questionLimit: 5
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    });

    const sessionId = sessionRes.data.session._id;
    console.log('Created session ID:', sessionId);

    // 3. Hit the /answer endpoint
    console.log('Hitting /answer endpoint...');
    const answerRes = await axios.post(`${BASE_URL}/api/interview-sessions/${sessionId}/answer`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Success! Response:', answerRes.data);

  } catch (error) {
    if (error.response) {
      console.error('Server responded with:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

debug();
