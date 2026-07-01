import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

export const verifyAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Check if the Authorization header exists and has the Bearer prefix
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    // Verify the token using Firebase Admin Auth module
    const decodedToken = await getAuth().verifyIdToken(token);

    // Attach the decoded user data to the request object
    req.user = decodedToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
