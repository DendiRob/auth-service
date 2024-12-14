export type TUpdateSession = {
  refresh_token?: string;
  refresh_expires_at?: Date;
  is_active?: boolean;
};

export type TCreateSession = {
  user_uuid: string;
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
};
