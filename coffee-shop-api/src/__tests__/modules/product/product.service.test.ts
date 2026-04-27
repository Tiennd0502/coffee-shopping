import AppDataSource from '@/config/database';
import { In } from 'typeorm';
import { Category } from '@/modules/category/category.entity';
import type { ListProductsQuery, UpdateProductInput } from '@/modules/product/product.dto';
import { ProductImage } from '@/modules/product/product-image.entity';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { Product } from '@/modules/product/product.entity';
import { findAllProducts, updateProduct } from '@/modules/product/product.service';
import { PRODUCT_SORT, PRODUCT_STATUS, ROAST_LEVEL } from '@/shared/enums/product';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { slugFrom } from '@/shared/utils/slug';

jest.mock('@/shared/utils/slug', () => ({
  slugFrom: jest.fn(),
}));

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockProductRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockImageRepo = {
  find: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  create: jest.fn((data: unknown) => data),
};

const mockVariantRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
};

const getRepositoryImpl = (entity: unknown): unknown => {
  if (entity === Product) return mockProductRepo;
  if (entity === ProductImage) return mockImageRepo;
  if (entity === ProductVariant) return mockVariantRepo;
  if (entity === Category) return mockCategoryRepo;
  return {};
};

const PRODUCT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const ADMIN_ID = '550e8400-e29b-41d4-a716-446655440000';
const OLD_CATEGORY_ID = 'c56a4180-65aa-4266-a945-5fd21dec0538';
const OTHER_PRODUCT_ID = 'aabbccdd-ee11-4566-8899-aabbccddeeff';
const NEW_CATEGORY_ID = '11223344-5566-4788-8899-aabbccddeeff';
const EXISTING_IMAGE_ID = 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_IMAGE_ID = 'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb';
const FOREIGN_IMAGE_ID = 'cccccccc-3333-4ccc-8ccc-cccccccccccc';

const makeExistingProduct = (): Product =>
  ({
    id: PRODUCT_ID,
    categoryId: OLD_CATEGORY_ID,
    name: 'Old Name',
    slug: 'old-name-abc123',
    description: null,
    roastLevel: ROAST_LEVEL.LIGHT,
    isOrganic: false,
    isFairTrade: false,
    status: PRODUCT_STATUS.DRAFT,
    tastingNotes: null,
    origin: null,
    processingMethod: null,
    createdBy: ADMIN_ID,
    updatedBy: null,
    deletedBy: null,
    variants: [],
    images: [],
    createdAt: new Date('2026-04-22T10:00:00Z'),
    updatedAt: new Date('2026-04-22T10:00:00Z'),
    deletedAt: null,
  }) as unknown as Product;

const makeExistingImage = (overrides: Partial<ProductImage> = {}): ProductImage =>
  ({
    id: EXISTING_IMAGE_ID,
    productId: PRODUCT_ID,
    url: 'https://example.com/old.jpg',
    isPrimary: false,
    sortOrder: 0,
    createdAt: new Date('2026-04-22T10:00:00Z'),
    updatedAt: new Date('2026-04-22T10:00:00Z'),
    ...overrides,
  }) as unknown as ProductImage;

describe('ProductService.updateProduct', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest
      .mocked(slugFrom)
      .mockImplementation((name: string) => `${name.toLowerCase().replace(/\s+/g, '-')}-xxxx`);

    jest
      .spyOn(AppDataSource, 'getRepository')
      .mockImplementation((entity: unknown) => getRepositoryImpl(entity) as never);

    jest
      .spyOn(AppDataSource, 'transaction')
      .mockImplementation((async (
        cb: (manager: { getRepository: (e: unknown) => unknown }) => Promise<unknown>,
      ) => cb({ getRepository: getRepositoryImpl })) as never);
  });

  it('updates scalar fields', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { status: PRODUCT_STATUS.ACTIVE, isOrganic: true };
    const saved = {
      ...existing,
      status: PRODUCT_STATUS.ACTIVE,
      isOrganic: true,
      updatedBy: ADMIN_ID,
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(saved);
    mockProductRepo.save.mockResolvedValue(saved);

    const result = await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(result.status).toBe(PRODUCT_STATUS.ACTIVE);
    expect(result.isOrganic).toBe(true);
    expect(result.updatedBy).toBe(ADMIN_ID);
    expect(mockProductRepo.save).toHaveBeenCalledTimes(1);
  });

  it('regenerates slug when name changes', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: 'New Name' };
    const expectedSlug = 'new-name-xxxx';
    const saved = { ...existing, name: 'New Name', slug: expectedSlug, updatedBy: ADMIN_ID };

    mockProductRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(saved);
    mockProductRepo.save.mockResolvedValue(saved);

    const result = await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(result.slug).toBe(expectedSlug);
    expect(slugFrom).toHaveBeenCalledWith('New Name');
  });

  it('returns current product when no fields provided', async () => {
    const existing = makeExistingProduct();
    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);

    const result = await updateProduct(PRODUCT_ID, {}, ADMIN_ID);

    expect(result.id).toBe(PRODUCT_ID);
    expect(mockCategoryRepo.findOne).not.toHaveBeenCalled();
    expect(slugFrom).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when product does not exist', async () => {
    mockProductRepo.findOne.mockResolvedValueOnce(null);

    await expect(updateProduct(PRODUCT_ID, {}, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when product disappears before final reload', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { status: PRODUCT_STATUS.ACTIVE };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(null);
    mockProductRepo.save.mockResolvedValue(existing);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when new category does not exist', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { categoryId: NEW_CATEGORY_ID };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockCategoryRepo.findOne.mockResolvedValueOnce(null);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ConflictError when regenerated slug collides with another product', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: 'Existing Name' };
    const otherProduct = { id: OTHER_PRODUCT_ID, slug: 'existing-name-xxxx' };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(otherProduct);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(ConflictError);
  });

  it('skips category lookup when categoryId unchanged', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      categoryId: OLD_CATEGORY_ID,
      status: PRODUCT_STATUS.ACTIVE,
    };

    mockProductRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ ...existing, status: PRODUCT_STATUS.ACTIVE });
    mockProductRepo.save.mockResolvedValue(existing);

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(mockCategoryRepo.findOne).not.toHaveBeenCalled();
  });

  it('skips slug regeneration when name unchanged', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: existing.name, status: PRODUCT_STATUS.ACTIVE };

    mockProductRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ ...existing, status: PRODUCT_STATUS.ACTIVE });
    mockProductRepo.save.mockResolvedValue(existing);

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(slugFrom).not.toHaveBeenCalled();
  });

  it('removes images by removeImageIds', async () => {
    const existing = makeExistingProduct();
    const toRemove = makeExistingImage({ id: EXISTING_IMAGE_ID });
    const input: UpdateProductInput = { removeImageIds: [EXISTING_IMAGE_ID] };

    mockProductRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ ...existing, images: [] });
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([toRemove]).mockResolvedValueOnce([]);
    mockImageRepo.delete.mockResolvedValue({ affected: 1 });

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.delete).toHaveBeenCalledWith({ id: In([EXISTING_IMAGE_ID]) });
  });

  it('throws BadRequestError when removeImageIds include ids not belonging to product', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      removeImageIds: [EXISTING_IMAGE_ID, FOREIGN_IMAGE_ID],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([makeExistingImage({ id: EXISTING_IMAGE_ID })]);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(mockImageRepo.delete).not.toHaveBeenCalled();
  });

  it('updates existing image fields while preserving id', async () => {
    const existing = makeExistingProduct();
    const target = makeExistingImage({ id: EXISTING_IMAGE_ID, isPrimary: false, sortOrder: 0 });
    const input: UpdateProductInput = {
      updateImages: [{ id: EXISTING_IMAGE_ID, isPrimary: true, sortOrder: 5 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce({
      ...existing,
      images: [{ ...target, isPrimary: true, sortOrder: 5 }],
    });
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find
      .mockResolvedValueOnce([target])
      .mockResolvedValueOnce([{ ...target, isPrimary: true, sortOrder: 5 }]);

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: EXISTING_IMAGE_ID, isPrimary: true, sortOrder: 5 }),
    ]);
  });

  it('throws BadRequestError when updateImages ids do not belong to product', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      updateImages: [{ id: FOREIGN_IMAGE_ID, isPrimary: true }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([]);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(mockImageRepo.save).not.toHaveBeenCalled();
  });

  it('adds new images', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      addImages: [{ url: 'https://example.com/new.jpg', isPrimary: true, sortOrder: 0 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([
      makeExistingImage({ isPrimary: true, url: 'https://example.com/new.jpg' }),
    ]);

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.com/new.jpg', productId: PRODUCT_ID }),
    );
    expect(mockImageRepo.save).toHaveBeenCalled();
  });

  it('throws BadRequestError when final images contain more than one primary', async () => {
    const existing = makeExistingProduct();
    const oldPrimary = makeExistingImage({ id: EXISTING_IMAGE_ID, isPrimary: true });
    const newPrimary = makeExistingImage({ id: OTHER_IMAGE_ID, isPrimary: true });
    const input: UpdateProductInput = {
      addImages: [{ url: 'https://example.com/x.jpg', isPrimary: true, sortOrder: 0 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([oldPrimary, newPrimary]);

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('throws BadRequestError when total images exceed the maximum', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      addImages: [{ url: 'https://example.com/new.jpg', isPrimary: false, sortOrder: 0 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce(
      Array.from({ length: 7 }, (_, i) =>
        makeExistingImage({ id: `imgid-${String(i)}`, sortOrder: i }),
      ),
    );

    await expect(updateProduct(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('combines remove + update + add in one request', async () => {
    const existing = makeExistingProduct();
    const imgA = makeExistingImage({ id: EXISTING_IMAGE_ID, isPrimary: true });
    const imgB = makeExistingImage({ id: OTHER_IMAGE_ID, sortOrder: 1 });
    const input: UpdateProductInput = {
      removeImageIds: [EXISTING_IMAGE_ID],
      updateImages: [{ id: OTHER_IMAGE_ID, isPrimary: true }],
      addImages: [{ url: 'https://example.com/new.jpg', isPrimary: false, sortOrder: 2 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find
      .mockResolvedValueOnce([imgA])
      .mockResolvedValueOnce([imgB])
      .mockResolvedValueOnce([
        { ...imgB, isPrimary: true },
        makeExistingImage({ id: 'new-id', url: 'https://example.com/new.jpg', sortOrder: 2 }),
      ]);

    await updateProduct(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.delete).toHaveBeenCalled();
    expect(mockImageRepo.save).toHaveBeenCalledTimes(2);
    expect(mockImageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.com/new.jpg', productId: PRODUCT_ID }),
    );
  });
});

describe('ProductService.findAllProducts', () => {
  const mockQb = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockListRepo = {
    createQueryBuilder: jest.fn(() => mockQb),
    find: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockQb.orderBy.mockReturnThis();
    mockQb.skip.mockReturnThis();
    mockQb.take.mockReturnThis();
    mockQb.andWhere.mockReturnThis();
    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockListRepo as never);
  });

  const DEFAULT_QUERY: ListProductsQuery = { page: 1, limit: 10 };
  const STUB_PRODUCT = { id: PRODUCT_ID } as Product;
  const STUB_FULL = { id: PRODUCT_ID, variants: [], images: [] } as unknown as Product;

  it('returns empty result and skips relation load when no products found', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await findAllProducts(DEFAULT_QUERY);

    expect(result.data).toEqual([]);
    expect(result.meta!.totalCount).toBe(0);
    expect(mockListRepo.find).not.toHaveBeenCalled();
  });

  it('returns paginated result with correct meta', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[STUB_PRODUCT], 1]);
    mockListRepo.find.mockResolvedValue([STUB_FULL]);

    const result = await findAllProducts(DEFAULT_QUERY);

    expect(result.data).toHaveLength(1);
    expect(result.meta!.totalCount).toBe(1);
    expect(result.meta!.currentPage).toBe(1);
    expect(result.meta!.pageCount).toBe(1);
  });

  it('applies status filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, status: PRODUCT_STATUS.ACTIVE });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.status = :status', {
      status: PRODUCT_STATUS.ACTIVE,
    });
  });

  it('applies categoryId filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, categoryId: OLD_CATEGORY_ID });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.categoryId = :categoryId', {
      categoryId: OLD_CATEGORY_ID,
    });
  });

  it('applies single roastLevel filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, roastLevel: [ROAST_LEVEL.DARK] });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.roastLevel IN (:...roastLevels)', {
      roastLevels: [ROAST_LEVEL.DARK],
    });
  });

  it('applies multiple roastLevel filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, roastLevel: [ROAST_LEVEL.DARK, ROAST_LEVEL.LIGHT] });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.roastLevel IN (:...roastLevels)', {
      roastLevels: [ROAST_LEVEL.DARK, ROAST_LEVEL.LIGHT],
    });
  });

  it('applies search filter with ILIKE on name and slug', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, search: 'Ethiopia' });

    expect(mockQb.andWhere).toHaveBeenCalledWith(
      'product.name ILIKE :search OR product.slug ILIKE :search',
      { search: '%Ethiopia%' },
    );
  });

  it('applies minPrice filter via correlated subquery on min variant price', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, minPrice: 10 });

    expect(mockQb.andWhere).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), {
      minPrice: 10,
    });
  });

  it('applies maxPrice filter via correlated subquery on min variant price', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, maxPrice: 50 });

    expect(mockQb.andWhere).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), {
      maxPrice: 50,
    });
  });

  it.each([
    [PRODUCT_SORT.NAME_ASC, 'product.name', 'ASC'],
    [PRODUCT_SORT.NAME_DESC, 'product.name', 'DESC'],
  ] as const)('sorts by %s → orderBy(%s, %s)', async (sortBy, field, dir) => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, sortBy });

    expect(mockQb.orderBy).toHaveBeenCalledWith(field, dir);
  });

  it('sorts by PRICE_ASC using min-variant subquery', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, sortBy: PRODUCT_SORT.PRICE_ASC });

    expect(mockQb.orderBy).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), 'ASC');
  });

  it('sorts by PRICE_DESC using min-variant subquery', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts({ ...DEFAULT_QUERY, sortBy: PRODUCT_SORT.PRICE_DESC });

    expect(mockQb.orderBy).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), 'DESC');
  });

  it('defaults to curated sort (createdAt DESC) when sortBy is omitted', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await findAllProducts(DEFAULT_QUERY);

    expect(mockQb.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
  });

  it('preserves original sort order of ids returned by pagination query', async () => {
    const P1 = { id: PRODUCT_ID } as Product;
    const P2 = { id: OTHER_PRODUCT_ID } as Product;
    const FULL_P1 = { ...P1, variants: [], images: [] } as unknown as Product;
    const FULL_P2 = { ...P2, variants: [], images: [] } as unknown as Product;

    mockQb.getManyAndCount.mockResolvedValue([[P1, P2], 2]);
    mockListRepo.find.mockResolvedValue([FULL_P2, FULL_P1]);

    const result = await findAllProducts(DEFAULT_QUERY);

    expect(result.data[0].id).toBe(PRODUCT_ID);
    expect(result.data[1].id).toBe(OTHER_PRODUCT_ID);
  });
});
