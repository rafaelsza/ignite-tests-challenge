import { AppError } from '../../../../shared/errors/AppError';
import { User } from '../../../users/entities/User';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from './CreateStatementUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let user: User;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

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
      const deposit = await createStatementUseCase.execute({
        user_id: user.id,
        amount: 500,
        description: 'Bonus',
        type: OperationType.DEPOSIT
      })

      const withdraw = await createStatementUseCase.execute({
        user_id: user.id,
        amount: 300,
        description: 'Ticket',
        type: OperationType.WITHDRAW
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
