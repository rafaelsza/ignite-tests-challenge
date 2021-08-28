import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    }

    await createUserUseCase.execute(user);

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(authenticate).toHaveProperty('token')
  })

  it('should not be able to authenticate an nonexistent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'incorrect@test.com',
        password: 'password'
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able authenticate user with incorrect password', () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: 'User test',
        email: 'email@test.com',
        password: 'password'
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: 'email@test.com',
        password: 'incorrect'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
