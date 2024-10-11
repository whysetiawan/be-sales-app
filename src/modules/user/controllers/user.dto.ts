export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface EditPasswordDto {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}
