import request from "../utils/request";
import config from "../config";

const apiAxios = request.createInst({
  timeout: 1000 * 40,
  baseURL: config.api.endpoint,
});

const api = {
  createStore(params) {
    return apiAxios.post("/store/create", params, "multipart/form-data");
  },
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
