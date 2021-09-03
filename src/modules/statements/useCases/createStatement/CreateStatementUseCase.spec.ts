import { AppError } from '../../../../shared/errors/AppError';
import { User } from '../../../users/entities/User';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from './CreateStatementUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let user: User;

describe('Authenticate User', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    user = await usersRepositoryInMemory.create({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })
  })

  it('should be able to create a new deposit', async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 100,
      description: 'Bonus',
      type: OperationType.DEPOSIT
    })

    expect(statement).toHaveProperty('id')
    expect(statement.type).toEqual('deposit')
    expect(statement.amount).toBe(100)
  })

  it('should be able to create a new withdrawal if there are enough funds', async () => {
    const user_receiver_transfer = await usersRepositoryInMemory.create({
      name: 'User Receiver Transfer',
      email: 'receiver-transfer@test.com',
      password: 'password'
    })

    const deposit = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 800,
      description: 'Bonus',
      type: OperationType.DEPOSIT
    })

    const withdraw = await createStatementUseCase.execute({
      user_id: user_receiver_transfer.id,
      sender_id: user.id,
      amount: 300,
      description: 'Value Transfers Payment',
      type: OperationType.WITHDRAW
    })

    expect(deposit.amount - withdraw.amount).toBe(500)
  })

  it('should be able to create a new transfer if there are enough funds', async () => {
    const deposit = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 500,
      description: 'Bonus School',
      type: OperationType.DEPOSIT
    })

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 300,
      description: 'Ticket',
      type: OperationType.TRANSFER
    })

    expect(deposit.amount - withdraw.amount).toBe(200)
  })

  it('should not be able to create a new withdrawal if there are not enough funds', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 100,
        description: 'Bonus',
        type: OperationType.DEPOSIT
      })

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 300,
        description: 'Ticket',
        type: OperationType.WITHDRAW
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new transfer if there are not enough funds', async () => {
    const user_receiver_transfer = await usersRepositoryInMemory.create({
      name: 'User Receiver Transfer Error',
      email: 'receiver-transfer-error@test.com',
      password: 'password'
    })

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 100,
        description: 'Bonus',
        type: OperationType.DEPOSIT
      })

      await createStatementUseCase.execute({
        user_id: user_receiver_transfer.id,
        sender_id: user.id,
        amount: 300,
        description: 'Value Transfers',
        type: OperationType.TRANSFER
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to create a new statement an nonexistent user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'id_nonexistent',
        amount: 1500,
        description: 'Wage',
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
