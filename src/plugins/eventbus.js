import EventBus from '@/utils/eventbus'

export default {
  install: function(Vue, options) {
    Vue.prototype.$bus = EventBus;
  },
};