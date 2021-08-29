import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    expect(response.status).toBe(201)
  })

  it('should not be able to create user with email already in use', async () => {
    const response2 = await request(app).post('/api/v1/users').send({
      name: 'User test 2',
      email: 'user@test.com',
      password: 'password2'
    })

    expect(response2.status).toBe(400)
  })
})
