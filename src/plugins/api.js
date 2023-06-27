import request from "../utils/request";

const apiAxios = request.createInst({
  timeout: 1000 * 15,
  baseURL: "http://8.219.189.64:9999",
});

const api = {
  createContract(params) {
    return apiAxios.post("/user/createContract", params);
  },
  signContract(params) {
    return apiAxios.post("/user/sign", params);
  },
  userContracts(account) {
    return apiAxios.get("/user/contracts", { account: account });
  },
  contractInfo(id) {
    return apiAxios.get("/user/contract", { id: id });
  },
};

export default {
  install: function (Vue, options) {
    Vue.prototype.$api = api;
  },
};
