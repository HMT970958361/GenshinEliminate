import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

let instance = axios.create({
    baseURL: '/',
    timeout: 12000,
    // headers: {
    //   'Content-Type':'application/json;charset:utf-8'
    // },
    // ...config
   })
    // 请求拦截器
    instance.interceptors.request.use(
        (config:AxiosRequestConfig) => {
          return config
        },
        (error: any) => {
          console.error(error)
        }
      )
      // 响应拦截器
      instance.interceptors.response.use(
        (res:AxiosResponse)=> {
          if (res.status === 200 || res.status === 304) {
                return Promise.resolve(res)
          } else {
            return Promise.reject(res)
          }
        },
        // 请求已发出，但是不在2xx的范围
        (error: AxiosError) => {
          const { response:res } = error
          if (res) {
            return Promise.reject(res)
          } else {
            console.error('网络连接异常,请稍后再试!')
          }
        }
      )
 class Request {
     get(url: string,config?: any,) {
      return instance.get(url, config)
    }
     post(url: string, config?: any) {
      return instance.post(url, config)
    }
     request(config:AxiosRequestConfig) {
      return instance(config)
    }
  }

  export default new Request