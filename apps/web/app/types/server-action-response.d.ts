interface ServerActionError {
  ok: false;
  error: string;
  description: string;
}

interface ServerActionSuccess<T> {
  ok: true;
  data: T;
}

export type ServerActionResponse<T> =
  | ServerActionError
  | ServerActionSuccess<T>;
