let isGlobalLoading = $state(false);

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export class ApiClient {
  private sk: string = '';
  private fetchFn: typeof fetch;

  constructor(fetchFn?: typeof fetch) {
    this.fetchFn = fetchFn || (typeof window !== 'undefined' ? fetch.bind(window) : fetch);
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="csrf-token"]');
      if (meta) {
        this.sk = (meta as HTMLMetaElement).content;
      }
    }
  }

  get loading() {
    return isGlobalLoading;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    isGlobalLoading = true;
    try {
      const url = new URL(path, window.location.origin);
      if (options.params) {
        Object.entries(options.params).forEach(([key, val]) => {
          url.searchParams.append(key, String(val));
        });
      }

      const headers = new Headers(options.headers || {});
      headers.set('X-Requested-With', 'fetch');

      let body = options.body;
      if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
        if (body instanceof FormData) {
          body.set('sk', this.sk);
        } else if (!(body instanceof BodyInit) && typeof body === 'object') {
           // JSON body case if needed in future
           // For now Hanrangon uses FormData for most POSTs
        }
      }

      const response = await this.fetchFn(url.toString(), {
        ...options,
        headers,
        body
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } finally {
      isGlobalLoading = false;
    }
  }

  get<T>(path: string, params?: Record<string, string | number>) {
    return this.request<T>(path, { method: 'GET', params });
  }

  post<T>(path: string, body?: BodyInit | FormData) {
    return this.request<T>(path, { method: 'POST', body });
  }
}

export const api = new ApiClient();
