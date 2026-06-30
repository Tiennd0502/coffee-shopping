import { render, screen } from '@testing-library/react';
import type React from 'react';
import { useParams, useRouter } from 'next/navigation';

import RoastDetailPageContent from '@/sections/RoastDetailPageContent';
import { useProductById } from '@/hooks/useProduct';
import { DISCOUNT_TYPE, PRODUCT_STATUS, PRODUCT_UNIT, ROAST_LEVEL } from '@repo/types';
import type { Product } from '@/types/product';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useProduct', () => ({
  useProductById: jest.fn(),
}));

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords = () => [];
  };

  globalThis.ResizeObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
});

const mockUseParams = jest.mocked(useParams);
const mockUseRouter = jest.mocked(useRouter);
const mockUseProductById = jest.mocked(useProductById);

const productFixture: Product = {
  id: 'product-1',
  categoryId: 'whole-bean',
  name: 'Ethiopian Yirgacheffe',
  description: 'Floral and citrus profile for pour-over.',
  roastLevel: ROAST_LEVEL.LIGHT,
  isOrganic: true,
  isFairTrade: true,
  status: PRODUCT_STATUS.ACTIVE,
  tastingNotes: 'Jasmine, Bergamot',
  origin: 'Yirgacheffe, Ethiopia',
  processingMethod: 'Washed',
  variants: [
    {
      sku: 'SKU-1',
      weight: 250,
      unit: PRODUCT_UNIT.G,
      price: 24,
      discountType: DISCOUNT_TYPE.PERCENT,
      discountValue: 0,
      quantity: 40,
    },
  ],
  images: [
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0ngZCuIkhGMVirQTIbqtvfqarQ6-b4am3esJOzM2TSdTr84lLHbLlhkT5ZBHMGQgfls4_95hLTBZb464-5Qcamdz4bdtNWwv85SUsugdUY0fTAn12kPSPUQBxQZwlp8zcAnISquJWCjCmrKHUhV4gks0swGFcTLKbGVFVyJLeBy6XtWOjROa2ylkENkFS22a59JgxpfkzOpu3jDAutGavF13QKQp9vKb6vCZVdyYUMzDYQuf5tnefPSj4RN3DcZjuBQFbR5yrCvE',
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('RoastDetailPageContent', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: 'product-1' });
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('shows loading skeleton when loading', () => {
    mockUseProductById.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useProductById>);

    render(<RoastDetailPageContent />);
    expect(screen.getByTestId('roast-detail-loading')).toBeInTheDocument();
  });

  it('shows error message and retry when error', () => {
    mockUseProductById.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: 'Network down' },
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useProductById>);

    render(<RoastDetailPageContent />);
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('renders product title and spec grid when loaded', () => {
    mockUseProductById.mockReturnValue({
      data: { data: productFixture },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useProductById>);

    render(<RoastDetailPageContent />);

    expect(screen.getByRole('heading', { name: 'Ethiopian Yirgacheffe' })).toBeInTheDocument();
    expect(screen.getByTestId('product-detail-spec-grid')).toBeInTheDocument();
    expect(screen.getByTestId('product-purchase-panel')).toBeInTheDocument();
    expect(screen.getByTestId('product-reviews-section')).toBeInTheDocument();
  });
});
