import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;


describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  })

  it('should be able show profile to user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'User test',
      email: 'user@test.com',
      password: 'password'
    })

    const showUserProfile = await showUserProfileUseCase.execute(user.id);

    expect(showUserProfile).toEqual(user)
  })

  it('should not be able show profile an nonexistent user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('id_nonexistent');
    }).rejects.toBeInstanceOf(AppError)
  })
})
