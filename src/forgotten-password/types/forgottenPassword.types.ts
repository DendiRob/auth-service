export type TForgottenPassword = {
  user_uuid: string;
  ip_address: string;
  user_agent: string;
  expires_at: Date;
};
