const axios = require('axios');

async function run() {
  try {
    const payload = {
      cpf: '00368676161',
      password: '12345678'
    };
    
    console.log('Sending login request to Railway production backend...');
    const response = await axios.post('https://vigiasaude-production.up.railway.app/auth/login', payload);
    console.log('Response Status:', response.status);
    console.log('Response Data keys:', Object.keys(response.data));
    console.log('User name:', response.data.user?.nome);
    console.log('Success! The production backend login API is working perfectly.');
  } catch (err) {
    console.error('Error during login api test:', err.response?.status, err.response?.data || err.message);
  }
}
run();
