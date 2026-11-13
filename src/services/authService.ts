import { Task, UserProfile } from '../types';

export interface AuthResponse {
  user: UserProfile | null;
  error?: string;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthResponse;
    return data.user || null;
  } catch {
    return null;
  }
}

export async function loginWithPassword(
  username: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.user) {
      return { error: data.error || 'Đăng nhập thất bại.' };
    }
    return { user: data.user };
  } catch {
    return { error: 'Không thể kết nối máy chủ xác thực.' };
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network errors on logout
  }
}

export async function updateUserProfileInDb(payload: {
  fullName: string;
  communeName: string;
  department: string;
  role?: string;
}): Promise<{ user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as AuthResponse;
    if (!res.ok || !data.user) {
      return { error: data.error || 'Không thể lưu cấu hình tài khoản.' };
    }
    return { user: data.user };
  } catch {
    return { error: 'Không thể kết nối máy chủ để lưu cấu hình.' };
  }
}

export async function fetchUserTasksFromDb(): Promise<Task[] | null> {
  try {
    const res = await fetch('/api/tasks', { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { tasks?: Task[] };
    return Array.isArray(data.tasks) ? data.tasks : [];
  } catch {
    return null;
  }
}

export async function saveTaskToDb(task: Task): Promise<void> {
  try {
    const cleanTask: Task = {
      ...task,
      originalDoc: {
        ...task.originalDoc,
        fileUrl: task.originalDoc.fileUrl?.startsWith('blob:')
          ? undefined
          : task.originalDoc.fileUrl,
      },
      attachments: task.attachments?.map((att) => ({
        ...att,
        fileUrl: att.fileUrl?.startsWith('blob:') ? undefined : att.fileUrl,
      })),
    };
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ task: cleanTask }),
    });
  } catch (err) {
    console.warn('Không thể đồng bộ công việc lên Postgres:', err);
  }
}

export async function deleteTaskFromDb(taskId: string): Promise<void> {
  try {
    await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Không thể xóa công việc trên Postgres:', err);
  }
}
