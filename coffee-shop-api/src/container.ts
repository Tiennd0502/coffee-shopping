import AppDataSource from '@/config/database';
import { CategoryController } from '@/modules/category/category.v1.controller';
import { Category } from '@/modules/category/category.entity';
import { CategoryRepository } from '@/modules/category/category.repository';
import { CategoryService } from '@/modules/category/category.service';
import { ProductController } from '@/modules/product/product.v1.controller';
import { Product } from '@/modules/product/product.entity';
import { ProductImage } from '@/modules/product/product-image.entity';
import { ProductImageRepository } from '@/modules/product/product-image.repository';
import { ProductRepository } from '@/modules/product/product.repository';
import { ProductService } from '@/modules/product/product.service';
import { ProductVariant } from '@/modules/product/product-variant.entity';
import { ProductVariantRepository } from '@/modules/product/product-variant.repository';
import { UserAddressRepository } from '@/modules/user/user-address.repository';
import { UserAddress } from '@/modules/user/user-address.entity';
import { UserController } from '@/modules/user/user.v1.controller';
import { UserRepository } from '@/modules/user/user.repository';
import { UserService } from '@/modules/user/user.service';
import { User } from '@/modules/user/user.entity';
import { ClerkController } from '@/modules/webhooks/clerk/clerk.controller';

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userAddressRepository = new UserAddressRepository(AppDataSource.getRepository(UserAddress));
const categoryRepository = new CategoryRepository(AppDataSource.getRepository(Category));
const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
const productImageRepository = new ProductImageRepository(
  AppDataSource.getRepository(ProductImage),
);
const productVariantRepository = new ProductVariantRepository(
  AppDataSource.getRepository(ProductVariant),
);

export const userService = new UserService(userRepository, userAddressRepository);
export const categoryService = new CategoryService(categoryRepository);
export const productService = new ProductService({
  productRepo: productRepository,
  imageRepo: productImageRepository,
  variantRepo: productVariantRepository,
  categoryRepo: categoryRepository,
  dataSource: AppDataSource,
});
export const userController = new UserController(userService);
export const categoryController = new CategoryController(categoryService);
export const productController = new ProductController(productService);
export const clerkController = new ClerkController(userService);
