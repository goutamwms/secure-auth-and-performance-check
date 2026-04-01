import { User } from '../models/User.js';
import { FilterQuery } from 'mongoose';

export type UserFilters = {
  name?: string;
  email?: string;
  role?: string;
  excludeAdmin?: boolean;
};

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

//type UserFilter = Partial<Pick<User, "name" | "email" | "role">>;

export type Pagination = {
  page?: number;
  limit?: number;
};

const EXTRACT_SAFE_USER_SELECT_OPTIONS = '--password -__v';

export const findUserById = async (id: string) => {
  return User.findById(id).select(EXTRACT_SAFE_USER_SELECT_OPTIONS);
};

export const findUserByEmail = (email: string) => {
  return User.findOne({ email });
};

export const findUsers = async (
  filters: UserFilters = {},
  { page = 1, limit = 10 }: Pagination = {},
) => {
  //const query: any = {};

  const query: FilterQuery<IUser> = {};

  //filters.excludeAdmin = false;
  //const { excludeAdmin, ...restFilters } = filters;

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.email) {
    query.email = filters.email.toLowerCase();
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.excludeAdmin) {
    query.role = { $ne: 'admin' };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select(EXTRACT_SAFE_USER_SELECT_OPTIONS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
    },
  };
};
