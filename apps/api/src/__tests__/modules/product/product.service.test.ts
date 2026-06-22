import { In } from 'typeorm';

import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '@/modules/product/product.dto';
import { ProductImage } from '@/modules/product/product-image.entity';
import { ProductImageRepository } from '@/modules/product/product-image.repository';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductService } from '@/modules/product/product.service';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { ProductVariantRepository } from '@/modules/product/product-variant.repository';
import { Product } from '@/modules/product/product.entity';
import { Category } from '@/modules/category/category.entity';
import { CategoryRepository } from '@/modules/category/category.repository';
import { PRODUCT_SORT, PRODUCT_STATUS, PRODUCT_UNIT, ROAST_LEVEL } from '@/shared/enums/product';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app';
import { withRandomSkuSuffix } from '@/shared/utils/sku';
import { slugFrom } from '@/shared/utils/slug';

jest.mock('@/shared/utils/slug', () => ({
  slugFrom: jest.fn(),
}));

jest.mock('@/shared/utils/sku', () => ({
  withRandomSkuSuffix: jest.fn((base: string) => base),
}));

jest.mock('@/config/logger', () => ({
  createModuleLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

const mockProductRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockImageRepo = {
  find: jest.fn(),
  softDelete: jest.fn(),
  save: jest.fn(),
  create: jest.fn((data: unknown) => data),
};

const mockVariantRepo = {
  findOne: jest.fn(),
  findBySku: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

const getRepositoryImpl = (entity: unknown): unknown => {
  if (entity === Product) return mockProductRepo;
  if (entity === ProductImage) return mockImageRepo;
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

describe('ProductService.update', () => {
  let service: ProductService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest
      .mocked(slugFrom)
      .mockImplementation((name: string) => `${name.toLowerCase().replace(/\s+/g, '-')}-xxxx`);

    mockDataSource.transaction.mockImplementation(
      async (cb: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
        cb({ getRepository: getRepositoryImpl }),
    );
    mockProductRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    });

    const productRepo = new ProductRepository(mockProductRepo as never);
    const imageRepo = new ProductImageRepository(mockImageRepo as never);
    const variantRepo = new ProductVariantRepository(mockVariantRepo as never);
    const categoryRepo = new CategoryRepository(mockCategoryRepo as never);

    service = new ProductService({
      productRepo,
      imageRepo,
      variantRepo,
      categoryRepo,
      dataSource: mockDataSource as never,
    });
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

    const result = await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(result.status).toBe(PRODUCT_STATUS.ACTIVE);
    expect(result.isOrganic).toBe(true);
    expect(result.updatedBy).toBe(ADMIN_ID);
    expect(mockProductRepo.save).toHaveBeenCalledTimes(1);
  });

  it('reloads product without images relation after update', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { status: PRODUCT_STATUS.ACTIVE };
    const saved = { ...existing, status: PRODUCT_STATUS.ACTIVE, updatedBy: ADMIN_ID };
    const reloaded = { ...saved, images: undefined } as unknown as Product;

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(reloaded);
    mockProductRepo.save.mockResolvedValue(saved);

    const result = await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(result.images).toBeUndefined();
  });

  it('regenerates slug when name changes', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: 'New Name' };
    const expectedSlug = 'new-name-xxxx';
    const saved = { ...existing, name: 'New Name', slug: expectedSlug, updatedBy: ADMIN_ID };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(saved);
    mockProductRepo.save.mockResolvedValue(saved);

    const result = await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(result.slug).toBe(expectedSlug);
    expect(slugFrom).toHaveBeenCalledWith('New Name');
  });

  it('returns current product when no fields provided', async () => {
    const existing = makeExistingProduct();
    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);

    const result = await service.update(PRODUCT_ID, {}, ADMIN_ID);

    expect(result.id).toBe(PRODUCT_ID);
    expect(mockCategoryRepo.findOne).not.toHaveBeenCalled();
    expect(slugFrom).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when product does not exist', async () => {
    mockProductRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.update(PRODUCT_ID, {}, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when product disappears before final reload', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { status: PRODUCT_STATUS.ACTIVE };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(null);
    mockProductRepo.save.mockResolvedValue(existing);

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when new category does not exist', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { categoryId: NEW_CATEGORY_ID };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockCategoryRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates categoryId when a new category exists', async () => {
    const existing = makeExistingProduct();
    const updated = { ...existing, categoryId: NEW_CATEGORY_ID, updatedBy: ADMIN_ID };
    const input: UpdateProductInput = { categoryId: NEW_CATEGORY_ID };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    mockCategoryRepo.findOne.mockResolvedValueOnce({ id: NEW_CATEGORY_ID } as Category);
    mockProductRepo.save.mockResolvedValue(updated);

    const result = await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({ where: { id: NEW_CATEGORY_ID } });
    expect(mockProductRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: NEW_CATEGORY_ID, updatedBy: ADMIN_ID }),
    );
    expect(result.categoryId).toBe(NEW_CATEGORY_ID);
  });

  it('throws ConflictError when regenerated slug collides with another product', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: 'Existing Name' };
    const otherProduct = { id: OTHER_PRODUCT_ID, slug: 'existing-name-xxxx' };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(otherProduct),
    });

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(ConflictError);
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

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockCategoryRepo.findOne).not.toHaveBeenCalled();
  });

  it('skips slug regeneration when name unchanged', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = { name: existing.name, status: PRODUCT_STATUS.ACTIVE };

    mockProductRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ ...existing, status: PRODUCT_STATUS.ACTIVE });
    mockProductRepo.save.mockResolvedValue(existing);

    await service.update(PRODUCT_ID, input, ADMIN_ID);

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
    mockImageRepo.softDelete.mockResolvedValue({ affected: 1 });

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.softDelete).toHaveBeenCalledWith({ id: In([EXISTING_IMAGE_ID]) });
  });

  it('throws BadRequestError when removeImageIds include ids not belonging to product', async () => {
    const existing = makeExistingProduct();
    const input: UpdateProductInput = {
      removeImageIds: [EXISTING_IMAGE_ID, FOREIGN_IMAGE_ID],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing);
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find.mockResolvedValueOnce([makeExistingImage({ id: EXISTING_IMAGE_ID })]);

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(mockImageRepo.softDelete).not.toHaveBeenCalled();
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

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: EXISTING_IMAGE_ID, isPrimary: true, sortOrder: 5 }),
    ]);
  });

  it('updates only sortOrder on an image when other patch fields are omitted', async () => {
    const existing = makeExistingProduct();
    const target = makeExistingImage({ id: EXISTING_IMAGE_ID, sortOrder: 0 });
    const input: UpdateProductInput = {
      updateImages: [{ id: EXISTING_IMAGE_ID, sortOrder: 9 }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce({
      ...existing,
      images: [{ ...target, sortOrder: 9 }],
    });
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find
      .mockResolvedValueOnce([target])
      .mockResolvedValueOnce([{ ...target, sortOrder: 9 }]);

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: EXISTING_IMAGE_ID, sortOrder: 9 }),
    ]);
  });

  it('updates image url via updateImages', async () => {
    const existing = makeExistingProduct();
    const target = makeExistingImage({ id: EXISTING_IMAGE_ID, url: 'https://example.com/old.jpg' });
    const input: UpdateProductInput = {
      updateImages: [{ id: EXISTING_IMAGE_ID, url: 'https://example.com/new.jpg' }],
    };

    mockProductRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce({
      ...existing,
      images: [{ ...target, url: 'https://example.com/new.jpg' }],
    });
    mockProductRepo.save.mockResolvedValue(existing);
    mockImageRepo.find
      .mockResolvedValueOnce([target])
      .mockResolvedValueOnce([{ ...target, url: 'https://example.com/new.jpg' }]);

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: EXISTING_IMAGE_ID, url: 'https://example.com/new.jpg' }),
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

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
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

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.create).toHaveBeenCalledWith([
      expect.objectContaining({ url: 'https://example.com/new.jpg', productId: PRODUCT_ID }),
    ]);
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

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
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

    await expect(service.update(PRODUCT_ID, input, ADMIN_ID)).rejects.toBeInstanceOf(
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

    await service.update(PRODUCT_ID, input, ADMIN_ID);

    expect(mockImageRepo.softDelete).toHaveBeenCalled();
    expect(mockImageRepo.save).toHaveBeenCalledTimes(2);
    expect(mockImageRepo.create).toHaveBeenCalledWith([
      expect.objectContaining({ url: 'https://example.com/new.jpg', productId: PRODUCT_ID }),
    ]);
  });
});

describe('ProductService.findById', () => {
  let service: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();

    const productRepo = new ProductRepository(mockProductRepo as never);
    const imageRepo = new ProductImageRepository(mockImageRepo as never);
    const variantRepo = new ProductVariantRepository(mockVariantRepo as never);
    const categoryRepo = new CategoryRepository(mockCategoryRepo as never);

    service = new ProductService({
      productRepo,
      imageRepo,
      variantRepo,
      categoryRepo,
      dataSource: mockDataSource as never,
    });
  });

  it('returns product with relations when found', async () => {
    const full = makeExistingProduct();
    mockProductRepo.findOne.mockResolvedValue(full);

    const result = await service.findById(PRODUCT_ID);

    expect(result).toBe(full);
    expect(mockProductRepo.findOne).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      relations: ['variants', 'images'],
    });
  });

  it('throws NotFoundError when product does not exist', async () => {
    mockProductRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(PRODUCT_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ProductService.findAll', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('delegates to repository.findAll with query and isAdmin option', async () => {
    const stub = {
      data: [],
      meta: { totalCount: 0, currentPage: 1, pageCount: 0, limit: 10 },
    };
    const findAllSpy = jest
      .spyOn(ProductRepository.prototype, 'findAll')
      .mockResolvedValue(stub as never);

    const productRepo = new ProductRepository(mockProductRepo as never);
    const imageRepo = new ProductImageRepository(mockImageRepo as never);
    const variantRepo = new ProductVariantRepository(mockVariantRepo as never);
    const categoryRepo = new CategoryRepository(mockCategoryRepo as never);
    const svc = new ProductService({
      productRepo,
      imageRepo,
      variantRepo,
      categoryRepo,
      dataSource: mockDataSource as never,
    });

    const query: ListProductsQuery = { page: 1, limit: 10 };
    const result = await svc.findAll(query, { isAdmin: true });

    expect(result).toBe(stub);
    expect(findAllSpy).toHaveBeenCalledWith(query, { isAdmin: true });
  });
});

describe('ProductService.create', () => {
  let service: ProductService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest
      .mocked(slugFrom)
      .mockImplementation((name: string) => `${name.toLowerCase().replace(/\s+/g, '-')}-xxxx`);

    mockDataSource.transaction.mockImplementation(
      async (cb: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
        cb({ getRepository: getRepositoryImpl }),
    );
    mockProductRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    });

    const productRepo = new ProductRepository(mockProductRepo as never);
    const imageRepo = new ProductImageRepository(mockImageRepo as never);
    const variantRepo = new ProductVariantRepository(mockVariantRepo as never);
    const categoryRepo = new CategoryRepository(mockCategoryRepo as never);

    service = new ProductService({
      productRepo,
      imageRepo,
      variantRepo,
      categoryRepo,
      dataSource: mockDataSource as never,
    });
  });

  const makeCategory = (): Category => ({ id: OLD_CATEGORY_ID }) as unknown as Category;

  const baseInput: CreateProductInput = {
    categoryId: OLD_CATEGORY_ID,
    name: 'Test Coffee',
    roastLevel: ROAST_LEVEL.MEDIUM,
    isOrganic: false,
    isFairTrade: false,
    status: PRODUCT_STATUS.DRAFT,
    variants: [
      {
        sku: 'SKU-01',
        weight: 250,
        unit: PRODUCT_UNIT.G,
        price: 100000,
        discountType: null,
        discountValue: null,
        quantity: 10,
      },
    ],
    images: [],
  };

  it('throws NotFoundError when category does not exist', async () => {
    mockCategoryRepo.findOne.mockResolvedValue(null);
    await expect(service.create(baseInput, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws BadRequestError when request contains duplicate SKUs', async () => {
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    const input: CreateProductInput = {
      ...baseInput,
      variants: [
        {
          sku: 'SKU-DUP',
          weight: 250,
          unit: PRODUCT_UNIT.G,
          price: 100000,
          discountType: null,
          discountValue: null,
          quantity: 10,
        },
        {
          sku: 'SKU-DUP',
          weight: 500,
          unit: PRODUCT_UNIT.G,
          price: 180000,
          discountType: null,
          discountValue: null,
          quantity: 5,
        },
      ],
    };
    await expect(service.create(input, ADMIN_ID)).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws ConflictError when product slug already exists', async () => {
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    mockProductRepo.findOne.mockResolvedValue(makeExistingProduct());
    await expect(service.create(baseInput, ADMIN_ID)).rejects.toBeInstanceOf(ConflictError);
  });

  it('creates product with generated SKUs and returns full relations', async () => {
    const input: CreateProductInput = {
      ...baseInput,
      variants: [
        {
          sku: 'SKU-01',
          weight: 250,
          unit: PRODUCT_UNIT.G,
          price: 100000,
          discountType: null,
          discountValue: null,
          quantity: 10,
        },
        {
          sku: 'SKU-02',
          weight: 500,
          unit: PRODUCT_UNIT.G,
          price: 180000,
          discountType: null,
          discountValue: null,
          quantity: 5,
        },
      ],
      images: [{ url: 'https://example.com/p1.jpg', isPrimary: true, sortOrder: 0 }],
    };
    const created = { id: PRODUCT_ID } as Product;
    const full = {
      ...makeExistingProduct(),
      variants: [{ sku: 'SKU-01-X' } as never, { sku: 'SKU-02-X' } as never],
      images: [makeExistingImage({ url: 'https://example.com/p1.jpg', isPrimary: true })],
    } as Product;

    jest.mocked(withRandomSkuSuffix).mockImplementation((base: string) => `${base}-X`);
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    mockProductRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(full);
    mockVariantRepo.findOne.mockResolvedValue(null);
    mockVariantRepo.create.mockImplementation((data: unknown) => data);
    mockImageRepo.create.mockImplementation((data: unknown) => data);
    mockProductRepo.create.mockReturnValue(created);
    mockProductRepo.save.mockResolvedValue(created);

    const result = await service.create(input, ADMIN_ID);

    expect(withRandomSkuSuffix).toHaveBeenCalledWith('SKU-01');
    expect(withRandomSkuSuffix).toHaveBeenCalledWith('SKU-02');
    expect(mockVariantRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: 'SKU-01-X',
        name: '250G',
        createdBy: ADMIN_ID,
      }),
    );
    expect(mockVariantRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: 'SKU-02-X',
        name: '500G',
        createdBy: ADMIN_ID,
      }),
    );
    expect(result).toEqual(full);
  });

  it('retries SKU generation when a candidate collides with another variant in the same request', async () => {
    const input: CreateProductInput = {
      ...baseInput,
      variants: [
        {
          sku: 'SKU-A',
          weight: 250,
          unit: PRODUCT_UNIT.G,
          price: 100000,
          discountType: null,
          discountValue: null,
          quantity: 10,
        },
        {
          sku: 'SKU-B',
          weight: 500,
          unit: PRODUCT_UNIT.G,
          price: 180000,
          discountType: null,
          discountValue: null,
          quantity: 5,
        },
      ],
    };
    const created = { id: PRODUCT_ID } as Product;
    const full = {
      ...makeExistingProduct(),
      variants: [{ sku: 'SHARED' } as never, { sku: 'SHARED-UNIQUE' } as never],
    } as Product;

    let suffixCall = 0;
    jest.mocked(withRandomSkuSuffix).mockImplementation(() => {
      suffixCall += 1;
      if (suffixCall === 1) return 'SHARED';
      if (suffixCall === 2) return 'SHARED';
      return 'SHARED-UNIQUE';
    });
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    mockProductRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(full);
    mockVariantRepo.findOne.mockResolvedValue(null);
    mockVariantRepo.create.mockImplementation((data: unknown) => data);
    mockImageRepo.create.mockImplementation((data: unknown) => data);
    mockProductRepo.create.mockReturnValue(created);
    mockProductRepo.save.mockResolvedValue(created);

    const result = await service.create(input, ADMIN_ID);

    expect(suffixCall).toBe(3);
    expect(mockVariantRepo.findOne).toHaveBeenCalledTimes(2);
    expect(result).toEqual(full);
  });

  it('throws ConflictError when unique SKU cannot be generated after max attempts', async () => {
    jest.mocked(withRandomSkuSuffix).mockReturnValue('SKU-COLLIDE');
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    mockProductRepo.findOne.mockResolvedValueOnce(null);
    mockVariantRepo.findOne.mockResolvedValue({ id: 'existing-variant' });

    await expect(service.create(baseInput, ADMIN_ID)).rejects.toBeInstanceOf(ConflictError);
    expect(mockVariantRepo.findOne).toHaveBeenCalledTimes(5);
    expect(mockProductRepo.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when saved product cannot be reloaded with relations', async () => {
    const created = { id: PRODUCT_ID } as Product;

    jest.mocked(withRandomSkuSuffix).mockImplementation((base: string) => `${base}-X`);
    mockCategoryRepo.findOne.mockResolvedValue(makeCategory());
    mockProductRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mockVariantRepo.findOne.mockResolvedValue(null);
    mockVariantRepo.create.mockImplementation((data: unknown) => data);
    mockImageRepo.create.mockImplementation((data: unknown) => data);
    mockProductRepo.create.mockReturnValue(created);
    mockProductRepo.save.mockResolvedValue(created);

    await expect(service.create(baseInput, ADMIN_ID)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ProductService.remove', () => {
  let service: ProductService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const productRepo = new ProductRepository(mockProductRepo as never);
    const imageRepo = new ProductImageRepository(mockImageRepo as never);
    const variantRepo = new ProductVariantRepository(mockVariantRepo as never);
    const categoryRepo = new CategoryRepository(mockCategoryRepo as never);

    service = new ProductService({
      productRepo,
      imageRepo,
      variantRepo,
      categoryRepo,
      dataSource: mockDataSource as never,
    });
  });

  it('updates product status to ARCHIVED before soft delete', async () => {
    const existing = makeExistingProduct();
    const mockQb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };

    mockProductRepo.findOne.mockResolvedValue(existing);
    mockDataSource.transaction.mockImplementation(
      async (
        cb: (manager: {
          createQueryBuilder: () => typeof mockQb;
          softDelete: jest.Mock;
        }) => Promise<unknown>,
      ) =>
        cb({
          createQueryBuilder: () => mockQb,
          softDelete: jest.fn().mockResolvedValue({}),
        }),
    );

    await service.remove(PRODUCT_ID, ADMIN_ID);

    expect(mockQb.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PRODUCT_STATUS.ARCHIVED,
        updatedBy: ADMIN_ID,
        deletedBy: ADMIN_ID,
      }),
    );
  });
});

describe('ProductRepository.findAll', () => {
  const mockQb = {
    withDeleted: jest.fn().mockReturnThis(),
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

  const listRepository = new ProductRepository(mockListRepo as never);

  beforeEach(() => {
    jest.clearAllMocks();
    mockQb.withDeleted.mockReturnThis();
    mockQb.orderBy.mockReturnThis();
    mockQb.skip.mockReturnThis();
    mockQb.take.mockReturnThis();
    mockQb.andWhere.mockReturnThis();
  });

  const DEFAULT_QUERY: ListProductsQuery = { page: 1, limit: 10 };
  const STUB_PRODUCT = { id: PRODUCT_ID } as Product;
  const STUB_FULL = { id: PRODUCT_ID, variants: [], images: [] } as unknown as Product;

  it('returns empty result and skips relation load when no products found', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await listRepository.findAll(DEFAULT_QUERY);

    expect(result.data).toEqual([]);
    expect(result.meta!.totalCount).toBe(0);
    expect(mockListRepo.find).not.toHaveBeenCalled();
  });

  it('returns paginated result with correct meta', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[STUB_PRODUCT], 1]);
    mockListRepo.find.mockResolvedValue([STUB_FULL]);

    const result = await listRepository.findAll(DEFAULT_QUERY);

    expect(result.data).toHaveLength(1);
    expect(result.meta!.totalCount).toBe(1);
    expect(result.meta!.currentPage).toBe(1);
    expect(result.meta!.pageCount).toBe(1);
  });

  it('applies status filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, status: PRODUCT_STATUS.ACTIVE });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.status = :status', {
      status: PRODUCT_STATUS.ACTIVE,
    });
  });

  it('applies categoryId filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, categoryId: OLD_CATEGORY_ID });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.categoryId = :categoryId', {
      categoryId: OLD_CATEGORY_ID,
    });
  });

  it('applies single roastLevel filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, roastLevel: [ROAST_LEVEL.DARK] });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.roastLevel IN (:...roastLevels)', {
      roastLevels: [ROAST_LEVEL.DARK],
    });
  });

  it('applies multiple roastLevel filter', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({
      ...DEFAULT_QUERY,
      roastLevel: [ROAST_LEVEL.DARK, ROAST_LEVEL.LIGHT],
    });

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.roastLevel IN (:...roastLevels)', {
      roastLevels: [ROAST_LEVEL.DARK, ROAST_LEVEL.LIGHT],
    });
  });

  it('applies search filter with ILIKE on name and slug', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, search: 'Ethiopia' });

    expect(mockQb.andWhere).toHaveBeenCalledWith(
      'product.name ILIKE :search OR product.slug ILIKE :search',
      { search: '%Ethiopia%' },
    );
  });

  it('applies minPrice filter via correlated subquery on min variant price', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, minPrice: 10 });

    expect(mockQb.andWhere).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), {
      minPrice: 10,
    });
  });

  it('applies maxPrice filter via correlated subquery on min variant price', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, maxPrice: 50 });

    expect(mockQb.andWhere).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), {
      maxPrice: 50,
    });
  });

  it.each([
    [PRODUCT_SORT.NAME_ASC, 'product.name', 'ASC'],
    [PRODUCT_SORT.NAME_DESC, 'product.name', 'DESC'],
  ] as const)('sorts by %s → orderBy(%s, %s)', async (sortBy, field, dir) => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, sortBy });

    expect(mockQb.orderBy).toHaveBeenCalledWith(field, dir);
  });

  it('sorts by PRICE_ASC using min-variant subquery', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, sortBy: PRODUCT_SORT.PRICE_ASC });

    expect(mockQb.orderBy).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), 'ASC');
  });

  it('sorts by PRICE_DESC using min-variant subquery', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll({ ...DEFAULT_QUERY, sortBy: PRODUCT_SORT.PRICE_DESC });

    expect(mockQb.orderBy).toHaveBeenCalledWith(expect.stringContaining('MIN(v.price)'), 'DESC');
  });

  it('defaults to curated sort (createdAt DESC) when sortBy is omitted', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY);

    expect(mockQb.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
  });

  it('defaults non-admin listing to ACTIVE products', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY);

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.status = :status', {
      status: PRODUCT_STATUS.ACTIVE,
    });
  });

  it('does not force ACTIVE status for admin listing', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY, { isAdmin: true });

    expect(mockQb.andWhere).not.toHaveBeenCalledWith('product.status = :status', {
      status: PRODUCT_STATUS.ACTIVE,
    });
  });

  it('applies status filter when admin explicitly requests status', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(
      { ...DEFAULT_QUERY, status: PRODUCT_STATUS.INACTIVE },
      { isAdmin: true },
    );

    expect(mockQb.andWhere).toHaveBeenCalledWith('product.status = :status', {
      status: PRODUCT_STATUS.INACTIVE,
    });
  });

  it('calls withDeleted and loads relations including soft-deleted for admin listings', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[STUB_PRODUCT], 1]);
    mockListRepo.find.mockResolvedValue([STUB_FULL]);

    await listRepository.findAll(DEFAULT_QUERY, { isAdmin: true });

    expect(mockQb.withDeleted).toHaveBeenCalled();
    expect(mockListRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: In([PRODUCT_ID]) },
        relations: ['variants', 'images'],
        withDeleted: true,
      }),
    );
  });

  it('does not enable withDeleted on the query builder for non-admin listings', async () => {
    mockQb.getManyAndCount.mockResolvedValue([[], 0]);

    await listRepository.findAll(DEFAULT_QUERY);

    expect(mockQb.withDeleted).not.toHaveBeenCalled();
  });

  it('preserves original sort order of ids returned by pagination query', async () => {
    const P1 = { id: PRODUCT_ID } as Product;
    const P2 = { id: OTHER_PRODUCT_ID } as Product;
    const FULL_P1 = { ...P1, variants: [], images: [] } as unknown as Product;
    const FULL_P2 = { ...P2, variants: [], images: [] } as unknown as Product;

    mockQb.getManyAndCount.mockResolvedValue([[P1, P2], 2]);
    mockListRepo.find.mockResolvedValue([FULL_P2, FULL_P1]);

    const result = await listRepository.findAll(DEFAULT_QUERY);

    expect(result.data[0].id).toBe(PRODUCT_ID);
    expect(result.data[1].id).toBe(OTHER_PRODUCT_ID);
  });
});

describe('ProductVariantRepository.findByIds', () => {
  const mockVariantListRepo = {
    find: jest.fn(),
  };

  const variantRepository = new ProductVariantRepository(mockVariantListRepo as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array without calling find when ids is empty', async () => {
    await expect(variantRepository.findByIds([])).resolves.toEqual([]);
    expect(mockVariantListRepo.find).not.toHaveBeenCalled();
  });

  it('finds by id In(...) and passes relations when provided', async () => {
    const ids = ['6ba7b810-9dad-11d1-80b4-00c04fd430c8', '7ba7b810-9dad-11d1-80b4-00c04fd430c8'];
    const rows = [{ id: ids[0] }, { id: ids[1] }] as ProductVariant[];
    mockVariantListRepo.find.mockResolvedValue(rows);

    const result = await variantRepository.findByIds(ids, ['product', 'product.images']);

    expect(mockVariantListRepo.find).toHaveBeenCalledWith({
      where: { id: In(ids) },
      relations: ['product', 'product.images'],
    });
    expect(result).toEqual(rows);
  });
});
