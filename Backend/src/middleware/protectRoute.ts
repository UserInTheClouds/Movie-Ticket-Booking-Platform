import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

export const verifyAuth = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1] as string;
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
