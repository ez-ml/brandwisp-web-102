import { NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  user: {
    uid: string;
    email?: string;
    name?: string;
  };
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
  error?: string;
  status?: number;
}

/**
 * Verifies Firebase authentication token from request headers
 * @param request - The NextRequest object
 * @param allowDevelopmentMode - Whether to allow test tokens in development
 * @returns AuthResult with user information or error
 */
export async function verifyAuthToken(
  request: NextRequest, 
  allowDevelopmentMode: boolean = true
): Promise<AuthResult> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header',
        status: 401
      };
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return {
        success: false,
        error: 'No token provided',
        status: 401
      };
    }

    // Allow development mode with test token
    if (allowDevelopmentMode && process.env.NODE_ENV === 'development' && token === 'test-token') {
      console.log('🔧 Development mode: Using test user');
      return {
        success: true,
        userId: 'test-user-id',
        user: {
          uid: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        }
      };
    }

    // Verify Firebase token
    try {
      const adminApp = getFirebaseAdmin();
      const auth = getAuth(adminApp);
      const decodedToken = await auth.verifyIdToken(token);
      
      return {
        success: true,
        userId: decodedToken.uid,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name
        }
      };
    } catch (authError) {
      console.error('Firebase auth error:', authError);
      return {
        success: false,
        error: 'Invalid authentication token',
        status: 401
      };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      success: false,
      error: 'Authentication verification failed',
      status: 500
    };
  }
}

/**
 * Higher-order function that wraps API route handlers with authentication
 * @param handler - The API route handler function
 * @param allowDevelopmentMode - Whether to allow test tokens in development
 * @returns Wrapped handler with authentication
 */
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<Response>,
  allowDevelopmentMode: boolean = true
) {
  return async (request: NextRequest): Promise<Response> => {
    const authResult = await verifyAuthToken(request, allowDevelopmentMode);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status || 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add auth info to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.userId = authResult.userId!;
    authenticatedRequest.user = authResult.user!;

    return handler(authenticatedRequest);
  };
}

/**
 * Utility function to get user ID from request (for existing code)
 * @param request - The NextRequest object
 * @param allowDevelopmentMode - Whether to allow test tokens in development
 * @returns User ID string or throws error
 */
export async function getUserIdFromRequest(
  request: NextRequest,
  allowDevelopmentMode: boolean = true
): Promise<string> {
  const authResult = await verifyAuthToken(request, allowDevelopmentMode);
  
  if (!authResult.success) {
    throw new Error(authResult.error || 'Authentication failed');
  }
  
  return authResult.userId!;
}

/**
 * Utility function to get full user info from request
 * @param request - The NextRequest object
 * @param allowDevelopmentMode - Whether to allow test tokens in development
 * @returns User object or throws error
 */
export async function getUserFromRequest(
  request: NextRequest,
  allowDevelopmentMode: boolean = true
): Promise<{ uid: string; email?: string; name?: string }> {
  const authResult = await verifyAuthToken(request, allowDevelopmentMode);
  
  if (!authResult.success) {
    throw new Error(authResult.error || 'Authentication failed');
  }
  
  return authResult.user!;
} 