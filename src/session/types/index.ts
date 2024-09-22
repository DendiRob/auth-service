export type TUpdateSession = {
  refresh_token: string;
  refresh_expires_at: Date;
};

export type TCreateSession = {
  user_uuid: string;
  refresh_token: string;
  refresh_expires_at: Date;
  ip_address?: string;
  user_agent?: string;
};
