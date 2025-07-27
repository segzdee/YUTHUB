// Test script to debug session persistence
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;

async function testSessionPersistence() {
  console.log('Testing session persistence...\n');

  // Create axios instance with cookie jar
  const client = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    timeout: 10000,
    headers: {
      'User-Agent': 'SessionTest/1.0',
    },
  });

  try {
    // 1. Test unauthenticated request
    console.log('1. Testing unauthenticated request...');
    try {
      const response = await client.get('/api/auth/user');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
    } catch (error) {
      console.log('Expected 401:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
    }

    // 2. Test session storage
    console.log('\n2. Checking session storage...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM sessions WHERE expire > NOW()'
    );
    console.log('Active sessions in database:', result.rows[0].count);

    // Get a sample session
    const sessionResult = await pool.query(
      'SELECT sid, expire, sess FROM sessions WHERE expire > NOW() ORDER BY expire DESC LIMIT 1'
    );
    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      console.log('Sample session ID:', session.sid);
      console.log('Session expires:', session.expire);
      console.log('Session has passport data:', !!session.sess.passport);
    }

    await pool.end();
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSessionPersistence();
