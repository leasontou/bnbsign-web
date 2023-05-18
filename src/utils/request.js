import axios from 'axios'
import EventBus from './eventbus'

function createInst(option){
  const inst = axios.create(option)
  inst.interceptors.response.use(
    response => {
      if (response.status === 200 && response.data.code==200) {
        return Promise.resolve(response);
      } else {
        if(response.data.code==200){
          EventBus.$emit("appMsg", {msg:'http error'});
        }else{
          EventBus.$emit("appMsg", {msg:response.data.msg});
        }
        return Promise.reject(response);
      }
    },
    error => {
      return Promise.reject(error.response);
    }
  );

  const getReq = (url, params) => {
    return new Promise((resolve, reject) => {
      inst.get(url,{params: params})
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  const postReq = (url, params, contentType) => {
    return new Promise((resolve, reject) => {
      if(contentType == 'multipart/form-data'){
        var headers = { "Content-Type": "multipart/form-data" }
        let data = new FormData();
        Object.keys(params).forEach(key =>{
          data.append(key, params[key]);
        })
        inst.post(url, data, {headers:headers})
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err.data)
          })
      }else{
        inst.post(url, params)
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err)
          })
      }
    });
  }

  return {
    get: getReq,
    post: postReq
  }
}

export default {
  createInst
}