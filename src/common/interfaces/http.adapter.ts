// export interface HttpAdapter {
//   get<T>(url: string): Promise<T>;
// }

export abstract class HttpAdapter {
  abstract get<T>(url: string): Promise<T>;
}
