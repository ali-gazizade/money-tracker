import request from 'supertest';
import app from '../app';

describe('Authentication', () => {
  describe('POST /auth/register_first', () => {
    it('should return an error if it is not the first user', async () => {
      const response = await request(app)
        .post('/auth/register_first')
        .send({
          name: 'User User',
          username: 'test2@example.com',
          password: 'testpassword2',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('There are existing users');
    });

    // Add more test cases for validation errors, etc.
  });

  describe('POST /auth/login', () => {
    it('should log in an existing user with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'test@example.com',
          password: 'testpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should return an error for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid password');
    });

    // Add more test cases for validation errors, etc.
  });
});