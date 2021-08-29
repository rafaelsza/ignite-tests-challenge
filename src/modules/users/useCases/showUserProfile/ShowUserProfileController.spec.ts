import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able show profile to user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password'
    })

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${responseToken.body.token}`
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('created_at')
    expect(response.body).toHaveProperty('updated_at')
  })

  it('should not be able show profile an nonexistent user', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer invalid-token`
    })

    expect(response.status).toBe(401)
  })
})
