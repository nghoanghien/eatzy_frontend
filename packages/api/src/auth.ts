import { http } from "./http";
import { IBackendRes, IReqLoginDTO, IResLoginDTO, IUserGetAccount } from "../../types/src";

// Auth API Endpoints
export const authApi = {
  login: (data: IReqLoginDTO) => {
    return http.post<IBackendRes<IResLoginDTO>>('/api/v1/auth/login', data) as unknown as Promise<IBackendRes<IResLoginDTO>>;
  },

  logout: () => {
    return http.post<IBackendRes<void>>('/api/v1/auth/logout');
  },

  getAccount: () => {
    return http.get<IBackendRes<IUserGetAccount>>('/api/v1/auth/account');
  },

  refreshToken: () => {
    return http.get<IBackendRes<IResLoginDTO>>('/api/v1/auth/refresh');
  }
};
