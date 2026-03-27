export interface MemberActivationStartPayload {
  member_id: string;
  email: string;
  date_of_birth: string;
}

export interface MemberActivationCompletePayload {
  member_id: string;
  otp: string;
  password: string;
  confirm_password: string;
}

export interface MemberActivationStartResponse {
  message: string;
  member_id: string;
  email: string;
  expires_in_minutes: number;
}

export interface MemberActivationCompleteResponse {
  message: string;
}

export interface ApiDataResponse<T> {
  data: T;
}
