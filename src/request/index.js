import axios from "axios";
//创建实例
const service = axios.create({
    //跨域不应该是固定到config中，之后再找别的方法
    // baseURL:"https://www.fastmock.site/mock/93d375c29d4ad21cb87bfb1e63574983/user",
    // baseURL: '/user',
    baseURL: '/api',
    // baseURL: "http://127.0.0.1:3000/",
    timeout:5000,
    headers:{
        "Content-Type":"application/json;charset=utf-8"
    }
})
//请求拦截，这里面已经加了token了
service.interceptors.request.use((config)=>{
    config.headers = config.headers || {}
    if(localStorage.getItem('token')){
        config.headers.token = localStorage.getItem('token')
    }else{
        config.headers.token = 'test'
    }
    return config
})
//响应拦截
service.interceptors.response.use((res)=>{
    const code = res.data.code
    if(code != 200){
        return Promise.reject(res.data)
    }
    
    return res.data
},(err)=>{
    console.log(err)
})
export default service