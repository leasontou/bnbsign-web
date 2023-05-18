const { ethers } = require("ethers");

const chain = {
  provider(){
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    return provider
  },
  on(event,callback){
    this.provider().on(event, callback);
  },
  getNetwork() {
    return this.provider().getNetwork()
  },
  addChain(chainConfig) {
    return window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [chainConfig],
    });
  },
  switchChain(chainId){
    return window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{chainId: chainId}],
    });
  },
  signer(){
    return this.provider().getSigner().getAddress()
  },
  requestPermission(){
    return window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
    });
  },
  requestAccount(){
    return this.provider().send("eth_requestAccounts", []);
  },
}

export default {
  install: function(Vue, options) {
    Vue.prototype.$chain = chain;
  },
};