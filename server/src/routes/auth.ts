import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import {
  clearAuthCookies,
  requiredCsrf,
  setAuthCookies,
} from '../utils/cookie.js';
import { requireAccessAuth, requiredRole } from '../middleware/auth.js';
import { AuthenticatedRequest, AuthTokenPayload } from '../utils/types.js';
import {
  clearFailedLoginAttempts,
  isAccLocked,
  registerFailedLoginAttempt,
  validateBody,
} from '../utils/helper.js';
import { loginSchema, registerSchema } from '../schemas/user.schema.js';
import { getUserById, getUserByEmail } from '../services/user.service.js';
import { getUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hasPassword = await bcrypt.hash(password, 15);

    const user = await User.create({
      name,
      email,
      password: hasPassword,
    });

    res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Register failed',
      error,
    });
  }
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (isAccLocked(user)) {
      return res.status(429).json({ message: 'Account locked' });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      await registerFailedLoginAttempt(user);

      if (isAccLocked(user)) {
        return res.status(429).json({ message: 'Account locked' });
      }

      return res.status(401).json({ message: 'Invalid' });
    }

    await clearFailedLoginAttempts(user);

    setAuthCookies(res, String(user._id), user.role);

    res.json({
      message: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error,
    });
  }
});

router.get(
  '/me',
  requireAccessAuth,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const user = await getUserById(req.authUser?.userId as string);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('req me', req.authUser);

      res.json(user);
    } catch (error) {
      res.status(401).json({
        message: 'Unauthorized',
        error,
      });
    }
  },
);

router.post('/refresh', requiredCsrf, async (req, res) => {
  try {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      return res.json(401).json({
        message: 'No refresh token',
      });
    }

    const decodedUserInfo = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as AuthTokenPayload;

    if (decodedUserInfo.type !== 'refresh') {
      return res.json(401).json({
        message: 'Invalied refresh token type provided',
      });
    }

    setAuthCookies(res, decodedUserInfo.userId, decodedUserInfo.role);

    return res.json({
      message: 'Token refreshed',
    });
  } catch {
    return res.json(401).json({
      message: 'Refresh failed',
    });
  }
});

router.post('/logout', requiredCsrf, async (_req, res) => {
  clearAuthCookies(res);
  return res.json({
    message: 'logged out',
  });
});

// router.get('/users', requireAccessAuth, requiredRole('admin') , async (req,res) => {
//   try{
//     const parsedQuery = listUsersQuerySchema.safeParse(req.query)

//     if(!parsedQuery.success) {
//        return res.status(400).json({message: 'Invalid query filters'})
//     }

//     const filters:Record<string,string> = {}

//     if(parsedQuery.data.role) {
//       filters.role = parsedQuery.data.role;
//     }

//     if(parsedQuery.data.name) {
//       filters.name = parsedQuery.data.name;
//     }

//     if(parsedQuery.data.email) {
//       filters.email = parsedQuery.data.email;
//     }

//     // const extractUsersList = await getUsersByFilter(filters);

//     // return res.json({users : extractUsersList});

//     const extractUsersList = await User.find(filters).select(
//             '-password',
//           );
//      return res.json({users : extractUsersList});
//   } catch {
//     return res.status(500).json({message: 'Failed to fetch users'})
//   }
// })

router.get('/users', requireAccessAuth, requiredRole('admin'), getUsers);

export default router;
