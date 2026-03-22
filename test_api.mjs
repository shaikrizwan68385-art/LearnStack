// Using global fetch (Node 18+)

async function test() {
  try {
    console.log('--- Testing Registration ---');
    const email = `test${Date.now()}@example.com`;
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: email,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    console.log('Registration Result:', regData);

    console.log('\n--- Testing AI Chat ---');
    const aiRes = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What is Full Stack Web Development?'
      })
    });
    const aiData = await aiRes.json();
    console.log('AI Chat Result:', aiData);

    console.log('\n--- Testing Enrollment ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: 'password123' })
    });
    const { accessToken } = await loginRes.json();

    const enrollRes = await fetch('http://localhost:5000/api/courses/1/enroll', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    });
    const enrollData = await enrollRes.json();
    console.log('Enrollment Result:', enrollData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
