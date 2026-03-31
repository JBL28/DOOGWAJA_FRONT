// errors/httpError.ts
export class HttpError extends Error {
  statusCode?: number;   // HTTP status (네트워크/알 수 없음 → 0)
  errorCode?: string;   // 서버 제공 인증/인가 코드
  url?: string;
  method?: string;
  raw?: unknown;        // 원본 payload (디버깅용)

  constructor(opts: {
    statusCode?: number;
    message?: string;
    errorCode?: string;
    url?: string;
    method?: string;
    raw?: unknown;
  }) {
    super(opts.message);
    this.name = "HttpError";
    this.statusCode = opts.statusCode;
    this.errorCode = opts.errorCode;
    this.url = opts.url;
    this.method = opts.method;
    this.raw = opts.raw;
  }
}