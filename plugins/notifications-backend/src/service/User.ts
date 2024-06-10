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
  const credentials = await httpAuth.credentials(req, { allow: ['user', 'service'] });

  if (credentials.principal.type === 'service') {
    return req.body.user;
  }

  const info = await userInfo.getUserInfo(credentials);
  return info.userEntityRef;
};
