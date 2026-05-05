import type { DataSource } from 'typeorm';

import { CategoryService } from '@/modules/category/category.service';
import { Category } from '@/modules/category/category.entity';
import { NotFoundError } from '@/shared/errors/app';

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
