import { urlBuilder } from '@/lib/utils';
import { useState } from 'react';
import { useCookies } from 'react-cookie';

export interface LoginRequest {
  nip?: string;
  nisn?: string;
  password: string;
}

export const useAuthStore = () => {
  const [, setCookie, removeCookie] = useCookies(['authToken', 'userData']);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (payload: LoginRequest, type: 'guru' | 'ketua-kelas') => {
    try {
      const response = await fetch(urlBuilder(`/auth/login-${type}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data)

      const expires = new Date();
      expires.setDate(expires.getDate() + 2);

      setCookie('authToken', data.token, { path: '/', expires });
      setCookie('userData', JSON.stringify(data.user_data), { path: '/', expires });

      return data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return error;
    }
  };

  const logout = () => {
    removeCookie('authToken', { path: '/' });
    removeCookie('userData', { path: '/' });
  };

  return {loading, setLoading, login, logout};
};

