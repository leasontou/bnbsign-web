<template>
  <v-dialog v-model="dialog" max-width="420" 
    @input="inputChange" 
    persistent
    overlay-opacity="0.8"
    content-class="dialog-bg rounded-xl">
    <v-card class="" color="transparent">
      <v-responsive :aspect-ratio="1/1" content-class="d-flex flex-column">
        <v-card-title>
          <span>Connect a wallet</span>
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
          <div @click="connectMetamask" 
            class="d-flex flex-row align-center pa-4 rounded-lg" 
            style="cursor:pointer;background: #F7F8FA;">
            <img style="width:28px;" src="../assets/img/common/metamask.png" />
            <span class="font-weight-bold text-subtitle-1 ml-3">MetaMask</span>
            <v-spacer></v-spacer>
            <v-progress-circular
              v-if="isLoading && connectType=='metamask'"
              :size="20"
              :width="2"
              indeterminate
              color="#895ff1"
            ></v-progress-circular>
          </div>
          <!-- <div
            class="d-flex flex-row align-center pa-4 rounded-lg mt-2" 
            style="cursor:pointer;background: #F7F8FA;">
            <img style="width:28px;" src="../assets/img/common/metamask.png" />
            <span class="font-weight-bold text-subtitle-1 ml-3">BNBChain Testnet</span>
            <v-spacer></v-spacer>
            <v-progress-circular
              v-if="isLoadingChain"
              :size="20"
              :width="2"
              indeterminate
              color="#895ff1"
            ></v-progress-circular>
          </div> -->
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
      connectType: ''
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
  methods:{
    close(){
      this.inputChange(false)
    },
    inputChange(opened){
      this.$emit('input',opened);
    },
    connectMetamask(){
      if (!utils.isMetamaskInstalled()) {
        this.$ui.showToast({msg: 'MetaMask not installed',color:'#ff0000'})
        return
      }
      this.connectType = 'metamask'
      this.isLoading = true
      this.$chain.requestAccount().then(accounts => {
        if(accounts.length>0){
          this.account = accounts[0]
          this.$bus.$emit("walletConnect", accounts[0])
        }
      }).then(()=>{
        this.close()
      }).catch(error =>{
        this.$ui.showError({
          error: error,
          msg: 'Connect Wallet Failed'
        })
      }).finally(() => {
        this.isLoading = false
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