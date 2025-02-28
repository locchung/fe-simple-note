import { toast } from 'react-toastify';
import { ILogin } from '../interfaces/types';
import { callApi } from './api';
import { LOCAL_STORAGE_KEY } from '../constants/localStorage';

const STATUS_CODE_SUCCESS = 204;

const authService = {
  signIn: async (payload: ILogin) => {
    try {
      const res = await callApi('/auth/signin', 'POST', '', payload)

      if (res.error) {
        toast.error(res.message);
        return;
      }

      const setValue = {
        accessToken: res?.data?.accessToken,
        refreshToken: res?.data?.refreshToken,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY.USER, JSON.stringify(setValue));
      // Set localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, res?.data?.accessToken)
      localStorage.setItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN, res?.data?.refreshToken)
      return res.data;
    } catch (error: any) {
      console.log(error)
      if (error?.status !== 200) {
        const errorMessage = 'Invalid email or password';

        toast.error(errorMessage || 'Invalid email or password');
        return;
      }
      return;
    }
  },
  signUp: async (payload: any) => {
    try {
      const res = await callApi('/auth/signup', 'POST', '', payload);

      if (res.error) {
        toast.error(res.message);
        return;
      }

      return res;
    } catch (error: any) {
      toast.error('Something went wrong');
      return;
    }
  },
  // refreshToken: async () => {
  //   try {
  //     const auth = getUserAuth();
  //     const res = await axios.post<IRefreshTokenResponse>('/auth/refresh', null, {
  //       baseURL: process.env.API_ENDPOINT || '',
  //       headers: {
  //         Authorization: `Bearer ${auth?.refreshToken || ''}`,
  //       },
  //     });

  //     const setValue = {
  //       token: res?.data?.token,
  //       refreshToken: res?.data?.refreshToken,
  //       expires: res?.data?.tokenExpires,
  //     };

  //     localStorage.setItem(LOCAL_STORAGE_KEY.USER, JSON.stringify(setValue));

  //     return setValue.token;
  //   } catch (error) {
  //     console.error(error);
  //     return '';
  //   }
  // },

  // logout: async () => {
  //   try {
  //     const auth = getUserAuth();
  //     await axios.post('/auth/logout', null, {
  //       baseURL: process.env.API_ENDPOINT || '',
  //       headers: {
  //         Authorization: `Bearer ${auth?.token || ''}`,
  //       },
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // },

};

export { authService };
