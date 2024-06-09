import express from 'express';
import {
  HttpAuthService,
  UserInfoService,
} from '@backstage/backend-plugin-api';

export const getUser = async (
  req: express.Request,
  httpAuth: HttpAuthService,
  userInfo: UserInfoService,
): Promise<string> => {
  const credentials = await httpAuth.credentials(req, { allow: ['user'] });
  const info = await userInfo.getUserInfo(credentials);
  return info.userEntityRef;
};
