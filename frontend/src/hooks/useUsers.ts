import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import type { UserSell } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<UserSell[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        console.error('Error al obtener usuarios:', err.response.data.error);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers };
}