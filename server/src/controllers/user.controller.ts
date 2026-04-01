import { Response } from 'express';
import { getUsersByFilter } from '../services/user.service.js';
import { listUsersQuerySchema } from '../schemas/user.schema.js';
import { AuthenticatedRequest } from '../utils/types.js';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsedQuery = listUsersQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid query filters',
        errors: parsedQuery.error.flatten(),
      });
    }

    const { name, email, role, page, limit } = parsedQuery.data;

    const result = await getUsersByFilter(
      {
        name,
        email,
        role,
        page,
        limit,
      },
      req.authUser?.role,
    );

    return res.json(result);
  } catch (error: unknown) {
    if (error) console.error(error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to fetch users',
    });
  }
};
