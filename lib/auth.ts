// Authentication utilities
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Constants
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // This will be hashed
  createdAt: Date;
}

// In-memory user store (replace with a database in production)
let users: User[] = [];

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Create JWT token
export function createToken(user: Omit<User, 'password'>): string {
  return sign(
    { 
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(token: string) {
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get current user from cookie
export function getCurrentUser() {
  const token = cookies().get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Clear auth cookie (logout)
export function clearAuthCookie() {
  cookies().set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

// User registration
export async function registerUser(username: string, email: string, password: string): Promise<User | null> {
  // Check if username or email already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return null;
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  // Create a new user
  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date()
  };
  
  // Add to users array (in a real app, save to database)
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return newUser;
}

// User login
export async function loginUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return null;
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
