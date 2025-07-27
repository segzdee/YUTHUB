const request = require('supertest');
const app = require('../../server/index');

describe('Security Tests', () => {
  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: maliciousInput, password: 'test' });

    expect(response.status).not.toBe(500);
    expect(response.body).not.toContain('DROP TABLE');
  });

  test('should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/organizations')
      .send({ name: xssPayload })
      .set('Authorization', 'Bearer valid-token');

    if (response.body.name) {
      expect(response.body.name).not.toContain('<script>');
    }
  });

  test('should enforce rate limiting', async () => {
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });

  test('should validate CORS headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://malicious-site.com');

    expect(response.headers['access-control-allow-origin']).not.toBe('*');
  });
});
