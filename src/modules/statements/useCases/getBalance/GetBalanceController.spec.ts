import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to get the balance from an user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test balance',
      email: 'user-balance@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-balance@test.com',
      password: 'password'
    })

    const deposit = await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 500,
      description: 'Bonus'
    })

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${responseToken.body.token}`
    })

    expect(response.status).toBe(200)
    expect(response.body.balance).toBe(500)
    expect(response.body.statement.length).toBe(1)
    expect(response.body.statement[0].id).toBe(deposit.body.id)
  })

  it('should not be able return balance an nonexistent user', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer token-nonexistent-user`
    })

    expect(response.status).toBe(401)
  })
})
