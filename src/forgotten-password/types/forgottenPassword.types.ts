export type TCreateForgottenPassword = {
  user_uuid: string;
  ip_address?: string;
  user_agent?: string;
};

export type TCreateForgottenPasswordAndSendEmail = TCreateForgottenPassword & {
  email: string;
};
