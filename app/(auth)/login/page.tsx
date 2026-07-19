'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableUsers, selectUser } from '../../../features/auth/authApi';
import { AppDispatch, RootState } from '../../../store';
import styles from './login.module.css';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, availableUsers } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchAvailableUsers());
  }, [dispatch]);

  const handleUserSelect = async (userId: string) => {
    const resultAction = await dispatch(selectUser(userId));
    if (selectUser.fulfilled.match(resultAction)) {
      router.push('/chat');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form} style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>Select User</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Choose a seeded user to log in. No password required.
        </p>

        {status === 'error' && (
          <p className={styles.error} style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            Something went wrong. Please try selecting a user again.
          </p>
        )}

        {availableUsers.length === 0 && status !== 'error' ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading users... (Did you run the seed script?)
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {availableUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserSelect(user._id)}
                disabled={status === 'authenticating'}
                style={{
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: status === 'authenticating' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                }}
                onMouseOver={(e) => {
                  if (status !== 'authenticating') e.currentTarget.style.background = 'var(--bg-surface)';
                }}
                onMouseOut={(e) => {
                  if (status !== 'authenticating') e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=2E3342&color=F8FAFC`}
                  alt={user.displayName}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-3)' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  {user.displayName}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                  @{user.username}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
