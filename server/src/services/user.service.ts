import {
  findUserById,
  findUserByEmail,
  findUsers,
  UserFilters,
} from '../repositories/user.repository.js';

export const getUserById = async (userId: string) => {
  return await findUserById(userId);
};

export const getUserByEmail = async (email: string) => {
  return await findUserByEmail(email);
};

// export const getUsersByFilter = async (filters :{name?: string, email?: string, role?: string} = {}) => {
//   return await findUsers(filters);
// };

type GetUsersInput = UserFilters & {
  page?: number;
  limit?: number;
};

export const getUsersByFilter = async (
  input: GetUsersInput = {},
  currentUserRole?: string,
) => {
  /*
    const filters = { ...input };
  */

  const { name, email, role } = input;

  // ✅ Normalize
  const normalizedEmail = email?.toLowerCase();

  console.log('user role', role);
  console.log('current user role', currentUserRole);

  //  Validate role
  if (role && !['user', 'admin'].includes(role)) {
    throw new Error('Invalid role');
  }

  // Pagination defaults
  const page = input.page || 1;
  const limit = input.limit || 10;

  const excludeAdmid = currentUserRole !== 'admin' ? true : false;
  console.log('excludeAdmid', excludeAdmid);

  const result = await findUsers(
    {
      name,
      email: normalizedEmail,
      role,
      excludeAdmin: role !== 'admin' ? true : false,
    },
    { page, limit },
  );

  if (result.meta.total === 0) {
    return {
      data: [],
      meta: result.meta,
      message: 'No users found',
    };
  }

  // transform
  const transformedUsers = result.data.map((u) => ({
    ...u,
    isAdmin: u.role === 'admin',
  }));

  return {
    ...result,
    data: transformedUsers,
  };

  //return result;
};

/*
if (filters.role !== "admin") {
  query.role = { $ne: "admin" };
}

if (!currentUser.isAdmin && filters.role) {
  throw new Error("Not allowed to filter by role");
}

users = users.map(u => ({
  ...u,
  isAdmin: u.role === "admin",
}));
*/

// If you want to go even more advanced:

// Global error handler middleware
// API response formatter (standard response shape)
// Redis caching in service layer
// RBAC using your role field
// DTO layer for strict typing

// If you want, I can help you convert this into a full production backend structure (like real SaaS apps) 🔥
