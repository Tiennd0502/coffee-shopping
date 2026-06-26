import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '@/modules/user/user.dto';
import { UserAddressRepository } from '@/modules/user/user-address.repository';
import { User } from '@/modules/user/user.entity';
import { UserRepository } from '@/modules/user/user.repository';
import { ClerkUserFields, UserService } from '@/modules/user/user.service';
import { USER_ROLE, USER_STATUS } from '@repo/types';
import { AppError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { ErrorCode } from '@/shared/errors/codes';

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
  createQueryBuilder: jest.fn(),
};

const mockAddressRepo = {
  find: jest.fn(),
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

  it('updates email when new address is not taken', async () => {
    const user = makeUser({ email: 'jane@example.com' });
    const saved = { ...user, email: 'fresh@example.com' };
    mockUserRepo.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(null);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    const result = await service.update(USER_ID, { email: 'fresh@example.com' });

    expect(result.email).toBe('fresh@example.com');
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'fresh@example.com' }),
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

  it('updates avatarUrl when provided', async () => {
    const user = makeUser();
    const saved = { ...user, avatarUrl: 'https://example.com/a.png' };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    const result = await service.update(USER_ID, { avatarUrl: 'https://example.com/a.png' });

    expect(result.avatarUrl).toBe('https://example.com/a.png');
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: 'https://example.com/a.png' }),
    );
  });

  it('sets avatarUrl to null when input.avatarUrl is null', async () => {
    const user = makeUser({ avatarUrl: 'https://example.com/old.png' });
    const saved = { ...user, avatarUrl: null };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { avatarUrl: null } as unknown as UpdateUserInput);

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ avatarUrl: null }));
  });

  it('clears clerkId when input.clerkId is null', async () => {
    const user = makeUser({ clerkId: CLERK_ID });
    const saved = { ...user, clerkId: null };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { clerkId: null });

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ clerkId: null }));
  });

  it('sets clerkId to a new value when not taken', async () => {
    const user = makeUser({ clerkId: 'old_clerk' });
    const saved = { ...user, clerkId: 'new_clerk' };
    mockUserRepo.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(null);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { clerkId: 'new_clerk' });

    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ clerkId: 'new_clerk' }),
    );
  });

  it('updates lastName when provided', async () => {
    const user = makeUser();
    const saved = { ...user, lastName: 'Smith' };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { lastName: 'Smith' });

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ lastName: 'Smith' }));
  });

  it('updates phoneNumber when provided', async () => {
    const user = makeUser();
    const saved = { ...user, phoneNumber: '0123456789' };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { phoneNumber: '0123456789' });

    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: '0123456789' }),
    );
  });

  it('clears phoneNumber when input is null', async () => {
    const user = makeUser({ phoneNumber: '0123' });
    const saved = { ...user, phoneNumber: null };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { phoneNumber: null });

    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ phoneNumber: null }));
  });

  it('updates status when provided', async () => {
    const user = makeUser();
    const saved = { ...user, status: USER_STATUS.INACTIVE };
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValueOnce(saved);

    await service.update(USER_ID, { status: USER_STATUS.INACTIVE });

    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: USER_STATUS.INACTIVE }),
    );
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

describe('UserService.findAddressesByUserId', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  it('delegates to address repository', async () => {
    const addresses = [{ id: 'addr-1' }] as never[];
    mockAddressRepo.find.mockResolvedValue(addresses);

    const result = await service.findAddressesByUserId(USER_ID);

    expect(mockAddressRepo.find).toHaveBeenCalledWith({ where: { userId: USER_ID } });
    expect(result).toBe(addresses);
  });
});

describe('UserService.findAll', () => {
  let service: UserService;
  const mockQb = {
    withDeleted: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQb.withDeleted.mockReturnThis();
    mockQb.where.mockReturnThis();
    mockQb.andWhere.mockReturnThis();
    mockQb.orderBy.mockReturnThis();
    mockQb.skip.mockReturnThis();
    mockQb.take.mockReturnThis();
    mockUserRepo.createQueryBuilder.mockReturnValue(mockQb);
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  it('returns paginated users and applies optional filters', async () => {
    const row = makeUser();
    mockQb.getManyAndCount.mockResolvedValue([[row], 1]);
    const query: ListUsersQuery = {
      page: 1,
      limit: 10,
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.ACTIVE,
      search: 'jane',
    };

    const result = await service.findAll(query, USER_ID);

    expect(mockUserRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(mockQb.where).toHaveBeenCalledWith('user.id != :currentUserId', {
      currentUserId: USER_ID,
    });
    expect(mockQb.andWhere).toHaveBeenCalledWith('user.role = :role', { role: USER_ROLE.ADMIN });
    expect(mockQb.andWhere).toHaveBeenCalledWith('user.status = :status', {
      status: USER_STATUS.ACTIVE,
    });
    expect(mockQb.andWhere).toHaveBeenCalledWith(
      "(user.firstName || ' ' || user.lastName) ILIKE :search OR user.email ILIKE :search",
      { search: '%jane%' },
    );
    expect(result.data).toEqual([row]);
    expect(result.meta!.totalCount).toBe(1);
    expect(mockQb.withDeleted).not.toHaveBeenCalled();
  });

  it('includes soft-deleted users when listing as admin', async () => {
    const row = makeUser();
    mockQb.getManyAndCount.mockResolvedValue([[row], 1]);

    await service.findAll({ page: 1, limit: 10, role: USER_ROLE.USER } as ListUsersQuery, USER_ID, {
      isAdmin: true,
    });

    expect(mockQb.withDeleted).toHaveBeenCalled();
  });
});

describe('UserService.findById', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  it('returns user when found', async () => {
    const user = makeUser();
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    await expect(service.findById(USER_ID)).resolves.toEqual(user);
  });

  it('throws NotFoundError when missing', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('UserService.create', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  const input: CreateUserInput = {
    email: 'new@example.com',
    firstName: 'New',
    lastName: 'Person',
    clerkId: 'clerk_new',
    status: USER_STATUS.ACTIVE,
    role: USER_ROLE.USER,
  };

  it('creates user when email and clerkId are free', async () => {
    const created = makeUser({ email: input.email, clerkId: input.clerkId });
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(created);
    mockUserRepo.save.mockResolvedValue(created);

    const result = await service.create(input);

    expect(result.email).toBe(input.email);
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws when email exists', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(makeUser());
    await expect(service.create(input)).rejects.toBeInstanceOf(ConflictError);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('throws when clerkId is taken', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(makeUser());
    await expect(service.create(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it('does not check clerkId uniqueness when clerkId is omitted', async () => {
    const created = makeUser({ clerkId: null });
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(created);
    mockUserRepo.save.mockResolvedValue(created);

    await service.create({ ...input, clerkId: undefined });

    expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);
  });
});

describe('UserService.findByClerkId', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  it('returns user when found', async () => {
    const user = makeUser();
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    await expect(service.findByClerkId(CLERK_ID)).resolves.toEqual(user);
  });

  it('returns null when not found', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findByClerkId('x')).resolves.toBeNull();
  });
});

describe('UserService.syncClerkUserUpdated', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
  });

  it('updates profile fields and role then saves', async () => {
    const user = makeUser();
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValue({
      ...user,
      email: 'u@example.com',
      role: USER_ROLE.ADMIN,
    });

    const fields: ClerkUserFields = {
      clerkId: CLERK_ID,
      email: 'u@example.com',
      firstName: 'A',
      lastName: 'B',
      phone: '0909',
      avatarUrl: 'https://ex.com/p.png',
      role: USER_ROLE.ADMIN,
    };

    await service.syncClerkUserUpdated(fields);

    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'u@example.com',
        firstName: 'A',
        lastName: 'B',
        phoneNumber: '0909',
        avatarUrl: 'https://ex.com/p.png',
        role: USER_ROLE.ADMIN,
      }),
    );
  });

  it('sets phoneNumber and avatarUrl to null when Clerk payload omits optional fields', async () => {
    const user = makeUser({ phoneNumber: '0123', avatarUrl: 'https://example.com/x.png' });
    mockUserRepo.findOne.mockResolvedValueOnce(user);
    mockUserRepo.save.mockResolvedValue({
      ...user,
      email: 'only@example.com',
      phoneNumber: null,
      avatarUrl: null,
    });

    const fields: ClerkUserFields = {
      clerkId: CLERK_ID,
      email: 'only@example.com',
      firstName: 'Only',
      lastName: 'Fields',
    };

    await service.syncClerkUserUpdated(fields);

    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'only@example.com',
        firstName: 'Only',
        lastName: 'Fields',
        phoneNumber: null,
        avatarUrl: null,
      }),
    );
  });

  it('returns early when user is not found', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.syncClerkUserUpdated({
        clerkId: 'missing',
        email: 'e@e.com',
        firstName: 'X',
        lastName: 'Y',
      }),
    ).resolves.toBeUndefined();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});

describe('UserService.syncClerkUserCreated', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    const userRepo = new UserRepository(mockUserRepo as never);
    const addressRepo = new UserAddressRepository(mockAddressRepo as never);
    service = new UserService({ userRepo, addressRepo, dataSource: {} as never });
    mockClerkUpdateUser.mockResolvedValue(undefined);
  });

  const fields: ClerkUserFields = {
    clerkId: CLERK_ID,
    email: 'sync@example.com',
    firstName: 'Sync',
    lastName: 'User',
  };

  it('creates user and syncs role to Clerk', async () => {
    const user = makeUser({ email: fields.email });
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(user);
    mockUserRepo.save.mockResolvedValue(user);

    await service.syncClerkUserCreated(fields);

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(mockClerkUpdateUser).toHaveBeenCalledWith(CLERK_ID, {
      publicMetadata: { role: USER_ROLE.USER },
    });
  });

  it('swallows ConflictError from create and returns', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(makeUser());

    await expect(service.syncClerkUserCreated(fields)).resolves.toBeUndefined();
    expect(mockClerkUpdateUser).not.toHaveBeenCalled();
  });

  it('resolves when Clerk role sync fails after create', async () => {
    const user = makeUser({ email: fields.email });
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(user);
    mockUserRepo.save.mockResolvedValue(user);
    mockClerkUpdateUser.mockRejectedValueOnce(new Error('Clerk down'));

    await expect(service.syncClerkUserCreated(fields)).resolves.toBeUndefined();
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rethrows non-conflict errors from create', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(makeUser());
    mockUserRepo.save.mockRejectedValueOnce(new Error('db fail'));

    await expect(service.syncClerkUserCreated(fields)).rejects.toThrow('db fail');
  });

  it('rethrows AppError that is not CONFLICT', async () => {
    mockUserRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockUserRepo.create.mockReturnValue(makeUser());
    mockUserRepo.save.mockRejectedValueOnce(
      new AppError('nope', 400, { code: ErrorCode.BAD_REQUEST }),
    );

    await expect(service.syncClerkUserCreated(fields)).rejects.toBeInstanceOf(AppError);
  });
});
