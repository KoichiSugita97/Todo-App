import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
    email: 'testuser@example.com',
    password: 'testpassword',
  });
    console.log('成功:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log('エラー:', error.response.data);
    } else {
      console.log('エラーが発生しました:', error.message);
    }
  }
}

testLogin();
