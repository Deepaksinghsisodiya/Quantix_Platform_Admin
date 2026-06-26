/**
 * Contacts API module.
 */

import { get, post, put } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Contact {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company: string;
  readonly type: 'Lead' | 'Customer' | 'Partner' | 'Vendor';
  readonly notes: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContactListParams extends PaginationParams {
  readonly search?: string;
  readonly type?: string;
}

export interface ContactCreate {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company?: string;
  readonly type: 'Lead' | 'Customer' | 'Partner' | 'Vendor';
  readonly notes?: string;
  readonly tags?: readonly string[];
}

export interface ContactUpdate {
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly type?: 'Lead' | 'Customer' | 'Partner' | 'Vendor';
  readonly notes?: string;
  readonly tags?: readonly string[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getContacts(params: ContactListParams): Promise<ApiListResponse<Contact>> {
  return get<ApiListResponse<Contact>>('/api/v1/contacts', params as unknown as Record<string, string | number>);
}

export function getContact(id: string): Promise<ApiResponse<Contact>> {
  return get<ApiResponse<Contact>>(`/api/v1/contacts/${id}`);
}

export function createContact(data: ContactCreate): Promise<ApiResponse<Contact>> {
  return post<ApiResponse<Contact>>('/api/v1/contacts', data);
}

export function updateContact(id: string, data: ContactUpdate): Promise<ApiResponse<Contact>> {
  return put<ApiResponse<Contact>>(`/api/v1/contacts/${id}`, data);
}
