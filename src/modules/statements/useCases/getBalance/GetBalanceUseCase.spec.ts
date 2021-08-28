import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetBalanceUseCase } from './GetBalanceUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Authenticate User', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  })

  it('should be able to get the balance from an user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    await statementsRepositoryInMemory.create({
      user_id: user.id,
      amount: 500,
      description: 'Bonus',
      type: OperationType.DEPOSIT
    })

    await statementsRepositoryInMemory.create({
      user_id: user.id,
      amount: 300,
      description: 'Ticket',
      type: OperationType.WITHDRAW
    })

    const balance = await getBalanceUseCase.execute({ user_id: user.id })

    expect(balance).toHaveProperty('balance');
    expect(balance).toHaveProperty('statement');
    expect(balance.balance).toEqual(200)
    expect(balance.statement.length).toEqual(2)
  })

  it('should not be able return balance an nonexistent user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'id_nonexistent' })
    }).rejects.toBeInstanceOf(AppError)
  })
})
