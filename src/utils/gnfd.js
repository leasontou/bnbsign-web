import {Client} from '@bnb-chain/greenfield-chain-sdk'

const GRPC_URL = "https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org"
const GREEN_CHAIN_ID = 5600
const client = Client.create(GRPC_URL, GREEN_CHAIN_ID);

const selectSp = async () => {
  const sps = await client.sp.getStorageProviders();
  const finalSps = (sps ?? []).filter((v) => v?.description?.moniker !== 'QATest');
  const selectIndex = 0;
  const secondarySpAddresses = [
    ...finalSps.slice(0, selectIndex),
    ...finalSps.slice(selectIndex + 1),
  ].map((item) => item.operatorAddress);
  const selectSpInfo = {
    endpoint: finalSps[selectIndex].endpoint,
    primarySpAddress: finalSps[selectIndex]?.operatorAddress,
    sealAddress: finalSps[selectIndex].sealAddress,
    secondarySpAddresses,
  };
  return selectSpInfo;
};

export default {
  ...client,
  selectSp
}