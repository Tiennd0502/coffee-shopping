import AppDataSource from '@/config/database';
import {
  Category,
  CategoryController,
  CategoryRepository,
  CategoryService,
} from '@/modules/category';
import {
  Order,
  OrderController,
  OrderRepository,
  OrderService,
  ShippingMethod,
  ShippingMethodRepository,
} from '@/modules/order';
import {
  Product,
  ProductController,
  ProductImage,
  ProductImageRepository,
  ProductRepository,
  ProductService,
  ProductVariant,
  ProductVariantRepository,
} from '@/modules/product';
import {
  User,
  UserAddress,
  UserAddressRepository,
  UserController,
  UserRepository,
  UserService,
} from '@/modules/user';
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
const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
const shippingMethodRepository = new ShippingMethodRepository(
  AppDataSource.getRepository(ShippingMethod),
);

export const userService = new UserService({
  userRepo: userRepository,
  addressRepo: userAddressRepository,
  dataSource: AppDataSource,
});
export const categoryService = new CategoryService({
  categoryRepo: categoryRepository,
  dataSource: AppDataSource,
});
export const productService = new ProductService({
  productRepo: productRepository,
  imageRepo: productImageRepository,
  variantRepo: productVariantRepository,
  categoryRepo: categoryRepository,
  dataSource: AppDataSource,
});
export const orderService = new OrderService({
  orderRepo: orderRepository,
  userRepo: userRepository,
  shippingRepo: shippingMethodRepository,
  variantRepo: productVariantRepository,
  dataSource: AppDataSource,
});

export const userController = new UserController(userService);
export const categoryController = new CategoryController(categoryService);
export const productController = new ProductController(productService);
export const orderController = new OrderController(orderService);
export const clerkController = new ClerkController(userService);
