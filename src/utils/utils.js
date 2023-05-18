
const { ethers } = require("ethers");

function isMetamaskInstalled() {
  if (typeof window.ethereum == "undefined") {
    return false;
  }
  return true;
}

function toFixed(value,fixedNum) {
  if(!value){
    return ''
  }
  let fixedValue = ethers.FixedNumber.from(value+'').toUnsafeFloat().toFixed(fixedNum)
  return clipFloat(fixedValue)
}
function clipFloat(value){
  if(!value){
    return ''
  }
  let num = value.toString()
  let newstr = num;
  let leng = num.length - num.indexOf('.') - 1;
  if (num.indexOf('.') > -1) {
    for (let i = leng; i > 0; i--) {
      if (
        newstr.lastIndexOf('0') > -1 &&
        newstr.substr(newstr.length - 1, 1) == 0
      ) {
        let k = newstr.lastIndexOf('0');
        if (newstr.charAt(k - 1) == '.') {
          return newstr.substring(0, k - 1);
        } else {
          newstr = newstr.substring(0, k);
        }
      } else {
        return newstr;
      }
    }
  }
  return num
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function addressEq(address0,address1){
  if(!address0 || !address1){
    return false
  }
  return address0.toLowerCase() == address1.toLowerCase()
}
function calculatePageTotal(pageSize, totalCount){
  return Math.ceil(totalCount/pageSize)
}
function calculateLiqPrice(orderType,entryPrice,size,collateral){
  
  if(orderType=="Long"){
    return ethers.BigNumber.from(entryPrice).sub(
              ethers.BigNumber.from(collateral)
                .mul(entryPrice)
                .div(size)
            )
  }else{
    return ethers.BigNumber.from(collateral)
            .mul(entryPrice)
            .div(size)
            .add(entryPrice)
  }
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

export default {
  isMetamaskInstalled,
  sleep,
  addressEq,
  clipFloat,
  calculatePageTotal,
  calculateLiqPrice,
  toFixed,
  guid,
}