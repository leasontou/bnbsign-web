
import EventBus from '../utils/eventbus'
const ui = {
  showLoading({title,msg,persistent}){
    EventBus.$emit("showLoading", {title,msg,persistent})
  },
  hideLoading(){
    EventBus.$emit("hideLoading");
  },
  showAction({name,msg,persistent}){
    EventBus.$emit("showAction", {name:name,msg:msg,persistent:persistent})
  },
  hideAction(){
    EventBus.$emit("hideAction");
  },
  showToast({msg,info,color}){
    EventBus.$emit("appMsg", {msg,info,color})
  },
  showSuccess({msg,info}){
    EventBus.$emit("appMsg", {msg,info,color:'success'})
  },
  showError({error,msg}){
    let code = (error && error.error && error.error.code)?error.error.code:''
    let reason = (error && error.reason)?error.reason:''
    if(!reason){
      reason = (error && error.message)?error.message:''
    }
    this.showToast({
      msg: `${msg}:${code}`,
      info: `${reason}`,
      color: 'error'
    })
  }
}

export default {
  install: function(Vue, options) {
    Vue.prototype.$ui = ui;
  },
};