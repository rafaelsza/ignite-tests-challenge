import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;


describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create new user', async () => {
    const userCreated = await createUserUseCase.execute({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    });

    expect(userCreated).toHaveProperty('id');
  })

  it('should not be able to create user with email already in use', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'User test',
        email: 'user@test.com',
        password: 'password'
      });

      await createUserUseCase.execute({
        name: 'User test 2',
        email: 'user@test.com',
        password: 'password2'
      });
    }).rejects.toBeInstanceOf(AppError)
  })
})
