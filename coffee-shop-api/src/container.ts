import AppDataSource from '@/config/database';
import { UserAddressRepository } from '@/modules/user/user-address.repository';
import { UserAddress } from '@/modules/user/user-address.entity';
import { UserController } from '@/modules/user/user.v1.controller';
import { UserRepository } from '@/modules/user/user.repository';
import { UserService } from '@/modules/user/user.service';
import { User } from '@/modules/user/user.entity';
import { ClerkController } from '@/modules/webhooks/clerk/clerk.controller';

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userAddressRepository = new UserAddressRepository(AppDataSource.getRepository(UserAddress));

export const userService = new UserService(userRepository, userAddressRepository);
export const userController = new UserController(userService);
export const clerkController = new ClerkController(userService);
