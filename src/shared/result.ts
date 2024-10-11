/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class Result<T, E> {
  get isSuccess(): boolean {
    return this instanceof Success;
  }

  get isFailure(): boolean {
    return this instanceof Failure;
  }

  static success<T, E>(value: T): Result<T, E> {
    return new Success<T, E>(value);
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Failure<T, E>(error);
  }

  get data(): T {
    return this.when({
      onSuccess: (s: Success<T, E>) => s.value,
      onFailure: (_: Failure<T, E>) => null as T,
    });
  }

  get error(): E {
    return this.when({
      onSuccess: (_: Success<T, E>) => null as E,
      onFailure: (f: Failure<T, E>) => f.error,
    });
  }

  abstract when<R>(_cases: {
    onSuccess: (_success: Success<T, E>) => R;
    onFailure: (_failure: Failure<T, E>) => R;
  }): R;

  toString(): string {
    return this.when<string>({
      onSuccess: (s: Success<T, E>) => `Success{_value: ${s}}`,
      onFailure: (f: Failure<T, E>) => `Failure{_value: ${f}}`,
    });
  }

  abstract equals(other: any): boolean;
}

class Success<T, E> extends Result<T, E> {
  private readonly _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  when<R>(cases: {
    onSuccess: (success: Success<T, E>) => R;
    onFailure: (failure: Failure<T, E>) => R;
  }): R {
    return cases.onSuccess(this);
  }

  toString(): string {
    return `Success{_value: ${this._value}}`;
  }

  equals(other: any): boolean {
    return other instanceof Success && this._value === other._value;
  }
}

class Failure<T, E> extends Result<T, E> {
  private readonly _error: E;

  constructor(error: E) {
    super();
    this._error = error;
  }

  get error(): E {
    return this._error;
  }

  when<R>(cases: {
    onSuccess: (success: Success<T, E>) => R;
    onFailure: (failure: Failure<T, E>) => R;
  }): R {
    return cases.onFailure(this);
  }

  toString(): string {
    return `Failure{_value: ${this._error}}`;
  }

  equals(other: any): boolean {
    return other instanceof Failure && this._error === other._error;
  }
}
