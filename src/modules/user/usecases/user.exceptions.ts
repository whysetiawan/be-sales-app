export class InvalidCredentials extends Error {
  constructor() {
    super('User not found');
  }
}

export class UserAlreadyExists extends Error {
  constructor() {
    super('User already exists');
  }
}

export class InvalidOldPassword extends Error {
  constructor() {
    super('Old password is invalid');
  }
}

export class InvalidNewPassword extends Error {}
