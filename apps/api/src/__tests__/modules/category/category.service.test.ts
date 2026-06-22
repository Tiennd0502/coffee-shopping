import type { DataSource } from 'typeorm';

import type { ListCategoriesQuery } from '@/modules/category/category.dto';
import { Category } from '@/modules/category/category.entity';
import { CategoryRepository } from '@/modules/category/category.repository';
import { CategoryService } from '@/modules/category/category.service';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { slugFrom } from '@/shared/utils/slug';

jest.mock('@/shared/utils/slug', () => ({
  slugFrom: jest.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
}));

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockCategoryRepo = {
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  findAll: jest.fn(),
};

const mockEntityManager = {
  getRepository: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
} as unknown as DataSource;

const makeCategory = (): Category =>
  ({
    id: 'cat-uuid-1',
    name: 'Espresso',
    slug: 'espresso',
    createdBy: 'admin-1',
    updatedBy: null,
    deletedBy: null,
  }) as unknown as Category;

const buildService = (): CategoryService =>
  new CategoryService({
    categoryRepo: mockCategoryRepo as never,
    dataSource: mockDataSource,
  });

describe('CategoryService.remove', () => {
  let service: CategoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
    (mockDataSource.transaction as jest.Mock).mockImplementation(
      async (cb: (manager: typeof mockEntityManager) => Promise<void>) => cb(mockEntityManager),
    );
  });

  it('saves audit fields and soft-deletes within one transaction', async () => {
    const category = makeCategory();
    const transactionalRepo = { save: jest.fn(), softDelete: jest.fn() };

    mockCategoryRepo.findById.mockResolvedValue(category);
    mockEntityManager.getRepository.mockReturnValue(transactionalRepo);

    await service.remove(category.id, 'admin-1');

    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(transactionalRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ updatedBy: 'admin-1', deletedBy: 'admin-1' }),
    );
    expect(transactionalRepo.softDelete).toHaveBeenCalledWith(category.id);
  });

  it('throws NotFoundError when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(service.remove('missing-category', 'admin-1')).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('propagates transactional failure so outer transaction rolls back', async () => {
    const category = makeCategory();
    const transactionalRepo = {
      save: jest.fn(),
      softDelete: jest.fn().mockRejectedValue(new Error('DB error')),
    };

    mockCategoryRepo.findById.mockResolvedValue(category);
    mockEntityManager.getRepository.mockReturnValue(transactionalRepo);

    await expect(service.remove(category.id, 'admin-1')).rejects.toThrow('DB error');
  });
});

describe('CategoryService.findAll', () => {
  let service: CategoryService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('delegates to repository with the query', async () => {
    const paged = {
      data: [makeCategory()],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockCategoryRepo.findAll.mockResolvedValue(paged);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(mockCategoryRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined);
    expect(result).toEqual(paged);
  });

  it('passes isAdmin option to repository', async () => {
    const paged = {
      data: [makeCategory()],
      meta: { currentPage: 1, pageCount: 1, limit: 10, totalCount: 1 },
    };
    mockCategoryRepo.findAll.mockResolvedValue(paged);

    await service.findAll({ page: 1, limit: 10 }, { isAdmin: true });

    expect(mockCategoryRepo.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { isAdmin: true },
    );
  });
});

describe('CategoryService.findById', () => {
  let service: CategoryService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('returns category when found', async () => {
    const category = makeCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    expect(await service.findById(category.id)).toEqual(category);
  });

  it('throws NotFoundError when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CategoryService.create', () => {
  let service: CategoryService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('creates category with slug and audit trail', async () => {
    const category = makeCategory();
    mockCategoryRepo.findByName.mockResolvedValue(null);
    mockCategoryRepo.create.mockReturnValue(category);
    mockCategoryRepo.save.mockResolvedValue(category);

    const result = await service.create({ name: 'Espresso' }, 'admin-1');

    expect(mockCategoryRepo.findByName).toHaveBeenCalledWith('Espresso');
    expect(mockCategoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Espresso', slug: 'espresso', createdBy: 'admin-1' }),
    );
    expect(result.id).toBe(category.id);
  });

  it('throws ConflictError when name already exists', async () => {
    mockCategoryRepo.findByName.mockResolvedValue(makeCategory());
    await expect(service.create({ name: 'Espresso' }, 'admin-1')).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(mockCategoryRepo.save).not.toHaveBeenCalled();
  });

  it('throws BadRequestError when name produces an empty slug', async () => {
    (slugFrom as jest.Mock).mockReturnValueOnce('');
    await expect(service.create({ name: '---' }, 'admin-1')).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});

describe('CategoryService.update', () => {
  let service: CategoryService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  it('updates name, regenerates slug, and sets updatedBy', async () => {
    const category = makeCategory();
    const updated = { ...category, name: 'Cold Brew', slug: 'cold-brew', updatedBy: 'admin-1' };
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByName.mockResolvedValue(null);
    mockCategoryRepo.save.mockResolvedValue(updated as unknown as Category);

    const result = await service.update(category.id, { name: 'Cold Brew' }, 'admin-1');

    expect(mockCategoryRepo.findByName).toHaveBeenCalledWith('Cold Brew');
    expect(mockCategoryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ updatedBy: 'admin-1' }),
    );
    expect(result.name).toBe('Cold Brew');
  });

  it('skips name uniqueness check when name is unchanged', async () => {
    const category = makeCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.save.mockResolvedValue(category);

    await service.update(category.id, { name: 'Espresso' }, 'admin-1');

    expect(mockCategoryRepo.findByName).not.toHaveBeenCalled();
  });

  it('throws ConflictError when new name is already taken', async () => {
    const category = makeCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByName.mockResolvedValue(makeCategory());

    await expect(service.update(category.id, { name: 'Latte' }, 'admin-1')).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('throws NotFoundError when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(service.update('missing', { name: 'X' }, 'admin-1')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe('CategoryRepository.findAll', () => {
  const mockQb = {
    withDeleted: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockListRepo = {
    createQueryBuilder: jest.fn(() => mockQb),
  };

  const listRepository = new CategoryRepository(mockListRepo as never);

  beforeEach(() => {
    jest.clearAllMocks();
    mockQb.withDeleted.mockReturnThis();
    mockQb.orderBy.mockReturnThis();
    mockQb.andWhere.mockReturnThis();
    mockQb.skip.mockReturnThis();
    mockQb.take.mockReturnThis();
  });

  const DEFAULT_QUERY: ListCategoriesQuery = { page: 1, limit: 10 };
  const STUB_CATEGORY = { id: 'cat-uuid-1', name: 'Espresso' } as Category;

  it('orders by createdAt DESC, paginates, and returns meta', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[STUB_CATEGORY], 1]);

    const result = await listRepository.findAll(DEFAULT_QUERY);

    expect(mockListRepo.createQueryBuilder).toHaveBeenCalledWith('category');
    expect(mockQb.orderBy).toHaveBeenCalledWith('category.createdAt', 'DESC');
    expect(mockQb.skip).toHaveBeenCalledWith(0);
    expect(mockQb.take).toHaveBeenCalledWith(10);
    expect(result.data).toEqual([STUB_CATEGORY]);
    expect(result.meta).toEqual({
      limit: 10,
      currentPage: 1,
      pageCount: 1,
      totalCount: 1,
    });
  });

  it('applies search filter on name and slug when search is set', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, search: 'esp' });

    expect(mockQb.andWhere).toHaveBeenCalledWith(
      'category.name ILIKE :search OR category.slug ILIKE :search',
      { search: '%esp%' },
    );
  });

  it('does not add search andWhere when search is omitted', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY);

    expect(mockQb.andWhere).not.toHaveBeenCalled();
  });

  it('includes soft-deleted rows when isAdmin is true', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY, { isAdmin: true });

    expect(mockQb.withDeleted).toHaveBeenCalled();
  });

  it('does not call withDeleted for non-admin listing', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY);

    expect(mockQb.withDeleted).not.toHaveBeenCalled();
  });
});
