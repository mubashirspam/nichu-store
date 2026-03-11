'use client';
import '@/lib/crypto-polyfill';
import { createAuthClient } from '@neondatabase/auth/next';
export const authClient = createAuthClient();
