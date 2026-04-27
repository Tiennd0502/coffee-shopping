import { Column, Entity, Index } from 'typeorm';

import { VALIDATION_RULES } from '@/shared/constants/validation';
import { BaseEntity } from '@/shared/entities/base';
import { USER_ROLE, USER_STATUS } from '@/shared/enums/user';

/**
 * Uniqueness for email / clerkId applies only to non–soft-deleted rows so a
 * new Clerk account can reuse an email after the previous row was soft-deleted.
 */
@Entity('users')
@Index('UQ_users_email_active', ['email'], { unique: true, where: '"deleted_at" IS NULL' })
@Index('UQ_users_clerk_id_active', ['clerkId'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "clerk_id" IS NOT NULL',
})
export class User extends BaseEntity {
  /** Clerk user id (`sub`), for correlating with auth and webhooks */
  @Column({ name: 'clerk_id', type: 'varchar', length: 64, nullable: true })
  clerkId!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: VALIDATION_RULES.PHONE.MAX_LENGTH,
    nullable: true,
  })
  phoneNumber!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'status', type: 'varchar', length: 16, default: USER_STATUS.ACTIVE })
  status!: USER_STATUS;

  @Column({ name: 'role', type: 'varchar', length: 16, default: USER_ROLE.USER })
  role!: USER_ROLE;
}
