import axios from 'axios';

// 创建一个 Axios 实例
const axiosInstance = axios.create({
    baseURL: 'https://tgserver.welikescwl.top/qwccy', // 设置基本的请求URL
    timeout: 10000, // 设置请求超时时间
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 在请求发送之前可以进行一些处理，比如添加 token 等
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        // 对响应数据进行处理
        return response.data;
    },
    (error) => {
        // 对响应错误进行处理
        return Promise.reject(error);
    }
);

export default axiosInstance;