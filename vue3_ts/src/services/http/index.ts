import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  errorInterceptor
} from './interceptors'

class HttpService {
  readonly apiUrl: string
  private axios = {} as AxiosInstance

  constructor (apiUrl: string) {
    this.apiUrl = apiUrl
    this.createAxiosInstance()
    this.registerInterceptors()
  }

  get<T> (url: string, config?: AxiosRequestConfig): Promise<T> {
    const parsedUrl = url.includes('http') ? url : this.apiUrl + url
    return this.axios.get(parsedUrl, config)
  }

  put<T> (url: string, payload: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    return this.axios.put(url, payload, config)
  }

  post<T> (url: string, payload?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    return this.axios.post(this.apiUrl + url, payload, config)
  }

  patch<T> (url: string, payload: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    return this.axios.patch(this.apiUrl + url, payload, config)
  }

  delete<T> (url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axios.delete(this.apiUrl + url, config)
  }

  private createAxiosInstance () {
    this.axios = axios.create()
  }

  private registerInterceptors () {
    this.axios.interceptors.response.use(
      (res: AxiosResponse) => responseInterceptor(res),
      (err: AxiosError) => errorInterceptor(err)
    )

    this.axios.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
  }
}

export const http = new HttpService(process.env.VUE_APP_API_URL as string + '/api')

// Can contain multiple instances, eg. =>
/* export const httpService = {
  auth: new HttpService(process.env.VUE_APP_AUTH_API_URL as string + '/api'),
  main: new HttpService(process.env.VUE_APP_API_URL as string)
} */
