<template>
  <v-dialog v-model="dialog" max-width="420" 
    @input="inputChange" 
    persistent
    overlay-opacity="0.8"
    content-class="dialog-bg rounded-xl">
    <v-card class="" color="transparent">
      <v-responsive :aspect-ratio="1/1" content-class="d-flex flex-column">
        <v-card-title>
          <span>Switch network</span>
          <v-spacer></v-spacer>
          <v-btn v-if="!persistent" icon @click="close" class="mr-n2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="d-flex flex-column flex-grow-1 justify-center">
          <v-spacer></v-spacer>
          <v-hover v-slot="{ hover }">
            <img src="../assets/img/common/bnbsign.png"
              class="mx-auto"
              :style="$vuetify.breakpoint.mobile?'width:40px':'width:60px;'"
              :class="hover?'rotate':''"/>
          </v-hover>
          <v-spacer></v-spacer>
          <div @click="addNetwork" 
            class="d-flex flex-row align-center pa-4 rounded-lg" 
            style="cursor:pointer;background: #F7F8FA;">
            <img style="width:28px;" src="../assets/img/common/bnb.svg" />
            <span class="font-weight-bold text-subtitle-1 ml-3">Add to Metamask</span>
            <v-spacer></v-spacer>
          </div>
          <div @click="switchNetwork" 
            class="d-flex flex-row align-center pa-4 rounded-lg mt-2" 
            style="cursor:pointer;background: #F7F8FA;">
            <img style="width:28px;" src="../assets/img/common/bnb.svg" />
            <span class="font-weight-bold text-subtitle-1 ml-3">Switch to {{networkName}}</span>
            <v-spacer></v-spacer>
            <v-progress-circular
              v-if="isLoading"
              :size="20"
              :width="2"
              indeterminate
              color="#895ff1"
            ></v-progress-circular>
          </div>
          <v-spacer class=""></v-spacer>
          <v-spacer class=""></v-spacer>
        </v-card-text>
      </v-responsive>
    </v-card>
  </v-dialog>
</template>

<script>
import utils from '../utils/utils'
const { ethers } = require("ethers");
import config from '../config'

export default {
  components:{
  },
  props:{
    value: {
      type: Boolean,
    },
    persistent: {
      type: Boolean,
      default: false
    },
  },
  data(){
    return {
      dialog: false,
      isLoading: false,
      isLoadingChain: false,
      connectType: '',
      networkName: ''
    }
  },
  watch:{
    value(newVal){
      if(newVal!=this.dialog){
        this.isLoading = false
      }
      this.dialog = newVal;
    }
  },
  mounted(){
    this.networkName = config.chain.name
  },
  methods:{
    close(){
      this.inputChange(false)
    },
    inputChange(opened){
      this.$emit('input',opened);
    },
    switchNetwork(){
      this.$chain.switchChain(
        ethers.utils.hexValue(
          config.chain.chainId
        ),
      ).then(() => {
        window.location.reload();
      }).catch(error => {
        this.$ui.showToast({msg: 'Switch network error',color:'#ff0000'})
      }).finally(()=>{
      })
    },
    addNetwork(){
      if (!utils.isMetamaskInstalled()) {
        this.$ui.showToast({msg: 'MetaMask not installed',color:'#ff0000'})
        return
      }
      
      this.$chain.addChain({
        chainId: ethers.utils.hexValue(
          config.chain.chainId
        ),
        rpcUrls: [config.chain.rpc],
        chainName: config.chain.name,
        nativeCurrency: {
          name: config.chain.nativeCurrency.name,
          decimals: config.chain.nativeCurrency.decimals,
          symbol: config.chain.nativeCurrency.symbol,
        },
        blockExplorerUrls: [config.chain.blockExplorerUrls],
      }).then(() => {
        window.location.reload();
      }).catch(error => {
        this.$ui.showToast({msg: 'Switch network error',color:'#ff0000'})
      }).finally(()=>{
      })
    }
  }
}
</script>

<style scoped>
.connect{
  background: rgb(41, 50, 73);
  cursor: pointer;
}
.connect:hover{
  background: rgba(173, 188, 255, 0.24);
}
</style>