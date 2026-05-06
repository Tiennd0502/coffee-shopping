import { UserAddressRepository } from '@/modules/user/user-address.repository';
import { User } from '@/modules/user/user.entity';
import { UserRepository } from '@/modules/user/user.repository';
import { UserService } from '@/modules/user/user.service';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';
import { ConflictError, NotFoundError } from '@/shared/errors/app';

const mockClerkDeleteUser = jest.fn();
const mockClerkUpdateUser = jest.fn();

jest.mock('@/config/clerk', () => ({
  clerkClient: {
    users: {
      updateUser: (...args: unknown[]) => mockClerkUpdateUser(...args),
      deleteUser: (...args: unknown[]) => mockClerkDeleteUser(...args),
    },
  },
}));

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockUserRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  softDelete: jest.fn(),
};

const mockAddressRepo = {
  findByUserId: jest.fn(),
};

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CLERK_ID = 'clerk_abc123';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: USER_ID,
    clerkId: CLERK_ID,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phoneNumber: null,
    avatarUrl: null,
    status: USER_STATUS.ACTIVE,
    role: USER_ROLE.USER,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  }) as User;

describe('UserService.update', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({
      userRepo,
      addressRepo,
      dataSource: {} as never,
    });
  });

  it('saves to DB without calling Clerk when role is unchanged', async () => {
    const user = makeUser();
    const saved = { ...user, firstName: 'Janet' };

    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { firstName: 'Janet' });

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(mockClerkUpdateUser).not.toHaveBeenCalled();
  });

  it('calls Clerk BEFORE saving to DB when role changes', async () => {
    const user = makeUser({ role: USER_ROLE.USER });
    const saved = { ...user, role: USER_ROLE.ADMIN };
    const callOrder: string[] = [];

    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockClerkUpdateUser.mockImplementation(async () => {
      callOrder.push('clerk');
    });
    mockUserRepo.save.mockImplementation(async () => {
      callOrder.push('db');
      return saved;
    });

    await service.update(USER_ID, { role: USER_ROLE.ADMIN });

    expect(callOrder).toEqual(['clerk', 'db']);
    expect(mockClerkUpdateUser).toHaveBeenCalledWith(CLERK_ID, {
      publicMetadata: { role: USER_ROLE.ADMIN },
    });
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('saves to DB without calling Clerk when role changes but user has no clerkId', async () => {
    const user = makeUser({ clerkId: null, role: USER_ROLE.USER });
    const saved = { ...user, role: USER_ROLE.ADMIN };

    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { role: USER_ROLE.ADMIN });

    expect(mockClerkUpdateUser).not.toHaveBeenCalled();
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('does NOT save to DB when Clerk throws on role change', async () => {
    const user = makeUser({ role: USER_ROLE.USER });

    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockClerkUpdateUser.mockRejectedValueOnce(new Error('Clerk API unavailable'));

    await expect(service.update(USER_ID, { role: USER_ROLE.ADMIN })).rejects.toThrow(
      'Clerk API unavailable',
    );
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when user does not exist', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.update(USER_ID, { firstName: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ConflictError when new email is already taken by another user', async () => {
    const user = makeUser();
    const other = makeUser({
      id: '22222222-2222-4222-8222-222222222222',
      email: 'taken@example.com',
    });

    mockUserRepo.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(other);

    await expect(service.update(USER_ID, { email: 'taken@example.com' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('throws ConflictError when new clerkId is already taken by another user', async () => {
    const user = makeUser({ clerkId: 'old_clerk' });
    const other = makeUser({
      id: '33333333-3333-4333-8333-333333333333',
      clerkId: 'taken_clerk',
    });

    mockUserRepo.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(other);

    await expect(service.update(USER_ID, { clerkId: 'taken_clerk' })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('returns saved user when no fields are provided', async () => {
    const user = makeUser();
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(user);

    const result = await service.update(USER_ID, {});

    expect(result.id).toBe(USER_ID);
    expect(mockClerkUpdateUser).not.toHaveBeenCalled();
  });

  it('does not call Clerk when new role equals existing role', async () => {
    const user = makeUser({ role: USER_ROLE.USER });
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(user);

    await service.update(USER_ID, { role: USER_ROLE.USER });

    expect(mockClerkUpdateUser).not.toHaveBeenCalled();
  });
});

describe('UserService.remove', () => {
  let service: UserService;
  const mockTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({
      userRepo,
      addressRepo,
      dataSource: { transaction: mockTransaction } as never,
    });
    mockClerkDeleteUser.mockResolvedValue(undefined);
  });

  it('calls clerkClient.users.deleteUser then anonymizes and soft-deletes in DB when user has clerkId', async () => {
    const user = makeUser({ clerkId: CLERK_ID });
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    const mockSave = jest.fn().mockResolvedValue(user);
    const mockSoftDelete = jest.fn().mockResolvedValue(undefined);
    mockTransaction.mockImplementation(async (cb: (manager: unknown) => Promise<void>) => {
      await cb({
        getRepository: () => ({ save: mockSave, softDelete: mockSoftDelete }),
      });
    });

    await service.remove(USER_ID);

    expect(mockClerkDeleteUser).toHaveBeenCalledWith(CLERK_ID);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        email: `deleted_${USER_ID}_jane@example.com`,
        status: USER_STATUS.INACTIVE,
      }),
    );
    expect(mockSoftDelete).toHaveBeenCalledWith(USER_ID);
    expect(mockUserRepo.softDelete).not.toHaveBeenCalled();
  });

  it('does NOT run DB transaction when Clerk deleteUser throws', async () => {
    const user = makeUser({ clerkId: CLERK_ID });
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockClerkDeleteUser.mockRejectedValueOnce(new Error('Clerk unavailable'));

    await expect(service.remove(USER_ID)).rejects.toThrow('Clerk unavailable');

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockUserRepo.softDelete).not.toHaveBeenCalled();
  });

  it('does NOT call Clerk and runs direct DB deletion when user has no clerkId', async () => {
    const user = makeUser({ clerkId: null });
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockTransaction.mockImplementation(async (cb: (manager: unknown) => Promise<void>) => {
      const fakeManager = {
        getRepository: () => ({
          save: jest.fn().mockResolvedValue(user),
          softDelete: jest.fn().mockResolvedValue(undefined),
        }),
      };
      await cb(fakeManager);
    });

    await service.remove(USER_ID);

    expect(mockClerkDeleteUser).not.toHaveBeenCalled();
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when user does not exist', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.remove(USER_ID)).rejects.toBeInstanceOf(NotFoundError);
    expect(mockClerkDeleteUser).not.toHaveBeenCalled();
  });
});

describe('UserService.syncClerkUserDeleted', () => {
  let service: UserService;
  const mockTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({
      userRepo,
      addressRepo,
      dataSource: { transaction: mockTransaction } as never,
    });
  });

  it('anonymizes email, sets INACTIVE, and softDeletes the user', async () => {
    const user = makeUser();
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockSoftDelete = jest.fn().mockResolvedValue(undefined);
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockTransaction.mockImplementation(async (cb: (manager: unknown) => Promise<void>) => {
      await cb({ getRepository: () => ({ save: mockSave, softDelete: mockSoftDelete }) });
    });

    await service.syncClerkUserDeleted(CLERK_ID);

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        email: `deleted_${USER_ID}_jane@example.com`,
        status: USER_STATUS.INACTIVE,
      }),
    );
    expect(mockSoftDelete).toHaveBeenCalledWith(USER_ID);
  });

  it('skips silently when user is not found by clerkId', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.syncClerkUserDeleted('unknown_clerk')).resolves.toBeUndefined();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
