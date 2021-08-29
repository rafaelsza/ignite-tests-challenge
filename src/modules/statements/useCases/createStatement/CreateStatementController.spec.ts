import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new deposit', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test deposit',
      email: 'user-deposit@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-deposit@test.com',
      password: 'password'
    })

    const response = await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 500,
      description: 'Bonus'
    })

    expect(response.status).toBe(201)
    expect(response.body.amount).toBe(500)
    expect(response.body.type).toBe('deposit')
  })

  it('should be able to create a new withdrawal if there are enough funds', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test withdraw',
      email: 'user-withdraw@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-withdraw@test.com',
      password: 'password'
    })

    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 500,
      description: 'Wage'
    })

    const response = await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 200,
      description: 'Car documents'
    })

    expect(response.status).toBe(201)
    expect(response.body.amount).toBe(200)
    expect(response.body.type).toBe('withdraw')
  })

  it('should not be able to create a new withdrawal if there are not enough funds', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'User test withdraw not enough funds',
      email: 'user-withdraw-not-enough-funds@test.com',
      password: 'password'
    })

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user-withdraw-not-enough-funds@test.com',
      password: 'password'
    })

    await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 500,
      description: '2nd job remuneration'
    })

    const response = await request(app).post('/api/v1/statements/withdraw').set({
      Authorization: `Bearer ${responseToken.body.token}`
    }).send({
      amount: 600,
      description: 'School'
    })

    expect(response.status).toBe(400)
  })

  it('should not be able to create a new statement an nonexistent user', async () => {
    const response = await request(app).post('/api/v1/statements/deposit').set({
      Authorization: `Bearer token-nonexistent-user`
    }).send({
      amount: 500,
      description: 'Wage test'
    })

    expect(response.status).toBe(401)
  })
})
