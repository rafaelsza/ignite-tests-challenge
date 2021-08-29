import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

import { v4 } from 'uuid';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to show statement of an user by id', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test statement by id',
      email: 'user-statement-by-id@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-statement-by-id@test.com',
      password: 'password'
    })

    const deposit = await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 500,
      description: 'Bonus'
    })

    const response = await request(app).get(`/api/v1/statements/${deposit.body.id}`).set({
      Authorization: `Bearer ${responseToken.body.token}`
    })

    expect(response.status).toBe(200)
    expect(response.body.amount).toBe('500.00')
    expect(response.body.description).toBe('Bonus')
  })

  it('should not be able to see a statement with nonexistent id', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test statement nonexistent id',
      email: 'user-statement-nonexistent-id@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-statement-nonexistent-id@test.com',
      password: 'password'
    })

    const response = await request(app).get(`/api/v1/statements/${v4()}`).set({
      Authorization: `Bearer ${responseToken.body.token}`
    })

    expect(response.status).toBe(404)
  })

  it('should not be able to see a statement with nonexistent user id', async () => {
    const response = await request(app).get(`/api/v1/statements/${v4()}`).set({
      Authorization: `Bearer token-nonexistent-user`
    })

    expect(response.status).toBe(401)
  })
})
