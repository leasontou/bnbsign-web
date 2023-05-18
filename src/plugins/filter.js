var moment = require('moment');
const { ethers, FixedNumber } = require("ethers");
import utils from '../utils/utils'
const Hashes = require('jshashes')
import Identicon from "identicon.js"

function toNonExponential(num) {
  var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}
 
const filters = {
  identicon(value){
    let hash = ""
    if(!value){
      hash = new Hashes.MD5().hex("BNBSign")
    }else{
      hash = new Hashes.MD5().hex(value)
    }
    var options = {
      foreground: [33, 211, 104, 255],            
      background: [238, 238, 238, 238],         // rgba white
      margin: 0.08,                              // 8% margin
      size: 200,                                // 420px square
    };
    var data = new Identicon(hash, options).toString();
    
    return `data:image/png;base64,${data}`
  },
  percent(value,fixedNum=2){
    if(!value){
      return "0%"
    }
    return utils.clipFloat(parseFloat(value*100).toFixed(fixedNum))+"%"
  },
  fixed(value,fixedNum,defaultValue){
    if(!value){
      return defaultValue | ''
    }
    const fValue = parseFloat(value+'')
    return fValue.toFixed(fixedNum)
  },
  unit(value,unit=18,fixed=4,defaultValue=0){
    if(!value){
      return defaultValue
    }
    
    const fValue = parseFloat(ethers.utils.formatUnits(value,unit))
    return utils.clipFloat(fValue.toFixed(fixed))
  },
  money(value,fixed=2,defaultValue=0){
    if(!value){
      return defaultValue
    }
    let str = utils.clipFloat(parseFloat(value).toFixed(fixed))
    if(str.indexOf('.') === -1){
      str += '.'
    }
    return str.replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace(/\.$/, '')
  },
  clipFloat(value,fixed=4,defaultValue=0){
    if(!value){
      return  defaultValue
    }
    const fValue = parseFloat(value)
    return utils.clipFloat(fValue.toFixed(fixed))
  },
  num(value,fixed,defaultValue){
    if(!value){
      return defaultValue | ''
    }
    let num = ethers.FixedNumber.fromString(value+"").toFormat("fixed128x"+fixed)
    return num;
  },
  amount(value){
    if(!value) return 0;
    return value >= 1e3 && value < 1e4 ? (value / 1e3).toFixed(1) + 'k' : value >= 1e4 ? (value / 1e4).toFixed(1) + 'w' : value 
  },
  commify(value,defaultValue=''){
    if(!value){
      return defaultValue
    }
    return ethers.utils.commify(value)
  },
  datetime(time,format='YYYY-MM-DD HH:mm:ss'){
    if (!time) {
      return ''
    }
    return moment(time).format(format)
  },
  hash(hashId,fixedLeft=6,fixedRight=0, defaultValue=''){
    if(!hashId){
      return defaultValue
    }
    var value = hashId
    if(!value.startsWith('0x')){
      value = '0x'+value
    }
    
    if(fixedLeft){
      let right = fixedRight
      if(!right){
        right = fixedLeft
      }
      return value.substr(0,fixedLeft)+'...'+value.substr(-right)
    }else{
      return value
    }
    
  },
  address(hash,fixedLeft=6,fixedRight=0, defaultValue=''){
    if(!hash){
      return defaultValue
    }
    var value = hash
    if(!value.startsWith('0x')){
      value = '0x'+value
    }
    
    if(fixedLeft){
      let right = fixedRight
      if(!right){
        right = fixedLeft
      }
      return value.substr(0,fixedLeft)+'...'+value.substr(-right)
    }else{
      return value
    }
    
  },
}

export default {
  install(Vue, options){
    Object.keys(filters).forEach(key => {
      Vue.filter(key, filters[key])
    })
  }
}