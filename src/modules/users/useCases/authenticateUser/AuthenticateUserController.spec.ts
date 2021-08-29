import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to authenticate an user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com',
      password: 'password'
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
  })

  it('should not be able to authenticate an nonexistent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'nonexistent@test.com',
      password: 'password'
    })

    expect(response.status).toBe(401)
  })

  it('should not be able authenticate user with incorrect password', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test incorrect password',
      email: 'incorrect-password@test.com',
      password: 'password'
    })

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'incorrect-password@test.com',
      password: 'incorrect'
    })

    expect(response.status).toBe(401)
  })
})
