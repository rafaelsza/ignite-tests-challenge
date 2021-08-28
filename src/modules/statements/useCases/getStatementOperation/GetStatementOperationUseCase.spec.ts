import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Authenticate User', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
  })

  it('should be able to show statement of an user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    const deposit = await statementsRepositoryInMemory.create({
      user_id: user.id,
      amount: 1500,
      description: 'Wage',
      type: OperationType.DEPOSIT
    })

    const statement = await getStatementOperationUseCase.execute({ user_id: user.id, statement_id: deposit.id })

    expect(statement).toHaveProperty('id')
    expect(statement.type).toEqual('deposit')
    expect(statement.amount).toEqual(1500)
  })

  it('should not be able to see a statement with nonexistent id', () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: 'User test',
        email: 'user@test.com',
        password: 'password'
      })

      await getStatementOperationUseCase.execute({ user_id: user.id, statement_id: 'id-nonexistent' })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to see a statement with nonexistent user id', () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: 'id-nonexistent', statement_id: 'test' })
    }).rejects.toBeInstanceOf(AppError)
  })
})
