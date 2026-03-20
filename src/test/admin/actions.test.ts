import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabaseAdmin module
vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: vi.fn(),
}));

// Mock next/cache and next/navigation (server action dependencies)
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
  usePathname: vi.fn(() => '/'),
}));

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { createClass, createSubject, saveUserClassesForm, toggleUserRole } from '@/app/admin/actions';

const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

// A thenable object that also exposes .single — used for eq() in both read and write chains.
// When awaited it resolves to resolvedValue; when used as a builder it exposes .single.
function makeEqResult(singleMock: ReturnType<typeof vi.fn>, resolvedValue: object) {
  const promise = Promise.resolve(resolvedValue);
  return {
    single: singleMock,
    error: null,
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });
  mockFrom.mockImplementation((_table: string) => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  }));
  mockInsert.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle, order: vi.fn() });
  mockSingle.mockResolvedValue({ data: { id: 'new-uuid', role: 'student' }, error: null });
  mockUpdate.mockReturnValue({ eq: mockEq });
  // mockEq returns an object with .single for the select chain AND is awaitable for the update chain
  mockEq.mockReturnValue(makeEqResult(mockSingle, { error: null }));
});

describe('createClass', () => {
  it('returns error when name is empty', async () => {
    const formData = new FormData();
    formData.set('name', '');
    const result = await createClass(formData);
    expect(result).toEqual({ success: false, error: 'Class name is required' });
  });

  it('calls supabase insert on classes table', async () => {
    const formData = new FormData();
    formData.set('name', 'M5');
    await createClass(formData);
    expect(mockFrom).toHaveBeenCalledWith('classes');
    expect(mockInsert).toHaveBeenCalledWith({ name: 'M5' });
    expect(revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('returns success on insert with no error', async () => {
    const formData = new FormData();
    formData.set('name', 'M5');
    const result = await createClass(formData);
    expect(result).toEqual({ success: true });
  });

  it('returns error when supabase insert fails', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Duplicate' } });
    const formData = new FormData();
    formData.set('name', 'M5');
    const result = await createClass(formData);
    expect(result).toEqual({ success: false, error: 'Duplicate' });
  });
});

describe('createSubject', () => {
  it('returns error when name is empty', async () => {
    const formData = new FormData();
    formData.set('name', '');
    const result = await createSubject(formData);
    expect(result).toEqual({ success: false, error: 'Subject name is required' });
  });

  it('calls supabase insert on subjects table with class_id', async () => {
    const formData = new FormData();
    formData.set('name', 'Mathematics');
    formData.set('class_id', 'class-uuid-1');
    await createSubject(formData);
    expect(mockFrom).toHaveBeenCalledWith('subjects');
    expect(mockInsert).toHaveBeenCalledWith({ name: 'Mathematics', description: null, class_id: 'class-uuid-1' });
    expect(revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('returns success on insert with no error', async () => {
    const formData = new FormData();
    formData.set('name', 'Mathematics');
    const result = await createSubject(formData);
    expect(result).toEqual({ success: true });
  });
});

describe('toggleUserRole', () => {
  it('sets role to admin when current role is student', async () => {
    // DB returns role: 'student', so new role should be 'admin'
    mockSingle.mockResolvedValue({ data: { id: 'user-uuid', role: 'student' }, error: null });
    const result = await toggleUserRole('user-uuid', 'student');
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockUpdate).toHaveBeenCalledWith({ role: 'admin' });
    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/users');
  });

  it('sets role to student when current role is admin', async () => {
    // DB returns role: 'admin', so new role should be 'student'
    mockSingle.mockResolvedValue({ data: { id: 'user-uuid', role: 'admin' }, error: null });
    const result = await toggleUserRole('user-uuid', 'admin');
    expect(mockUpdate).toHaveBeenCalledWith({ role: 'student' });
    expect(result).toEqual({ success: true });
  });

  it('returns error when DB fetch fails', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'User not found' } });
    const result = await toggleUserRole('user-uuid', 'student');
    expect(result).toEqual({ success: false, error: 'User not found' });
  });

  it('returns error when update fails', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'user-uuid', role: 'student' }, error: null });
    // First eq() call is for the select chain (returns obj with .single); second is for update (returns error)
    mockEq.mockReturnValueOnce(makeEqResult(mockSingle, { error: null }));
    mockEq.mockReturnValueOnce(makeEqResult(mockSingle, { error: { message: 'Permission denied' } }));
    const result = await toggleUserRole('user-uuid', 'student');
    expect(result).toEqual({ success: false, error: 'Permission denied' });
  });
});

describe('saveUserClassesForm', () => {
  it('returns error when name is empty', async () => {
    const formData = new FormData();
    formData.set('name', '');
    const result = await saveUserClassesForm(formData);
    expect(result).toEqual({ success: false, error: 'Class name is required' });
  });

  it('calls supabase insert on classes table and revalidates', async () => {
    const formData = new FormData();
    formData.set('name', 'M6');
    await saveUserClassesForm(formData);
    expect(mockFrom).toHaveBeenCalledWith('classes');
    expect(mockInsert).toHaveBeenCalledWith({ name: 'M6' });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/classes');
  });

  it('returns success on insert with no error', async () => {
    const formData = new FormData();
    formData.set('name', 'M6');
    const result = await saveUserClassesForm(formData);
    expect(result).toEqual({ success: true });
  });
});
