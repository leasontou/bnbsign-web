const bnbTestData = require("./contract/contract-bscTestnet.json")

const contractData = bnbTestData
const chainConfig = {
  chainId: contractData.chainId,
  name: contractData.network,
  rpc: contractData.rpc,
  blockExplorerUrls: contractData.blockExplorerUrls,
  nativeCurrency: {
    name: contractData.nativeCurrency.name,
    decimals: contractData.nativeCurrency.decimals,
    symbol: contractData.nativeCurrency.symbol
  },
  store: {
    abi: require("./abi/Store.json"),
    address: contractData.store,
  },
  sign: {
    abi: require("./abi/Sign.json"),
    address: contractData.sign,
  }
}

const apiConfig = {
  endpoint: contractData.apiEndpoint,
}

export default {
  chain: chainConfig,
  api: apiConfig
}
