import chain from './chain'
import eventbus from './eventbus'
import filter from './filter'
import api from './api'
import ui from './ui'

const plugins = [
  chain,
  eventbus,
  filter,
  api,
  ui
]

export default {
  install: function(Vue, options) {
    plugins.forEach(plugin => {
        Vue.use(plugin);
    });
  }
}