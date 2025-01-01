export type TSendAuthConfirmation = {
  to: string;
  user_uuid: string;
  confirmationUuid: string;
};

export type TSendForgottenPasswordLink = {
  to: string;
  forgottenPasswordUuid: string;
  accountName: string;
};
