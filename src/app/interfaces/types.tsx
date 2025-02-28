export interface INoteForm {
  title: string
  content: string
}

export interface INote {
  _id: string
  title: string
  content: string
  updatedAt: string
}

export interface AuthState {
  accessToken: string
  refreshToken: string
}

export interface AuthContextType extends AuthState {
  setUser?: any;
  setToken: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuth {
  token: string;
  refreshToken: string;
  expires: number;
}

export interface IRefreshTokenResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
}
