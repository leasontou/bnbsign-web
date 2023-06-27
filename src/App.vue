<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
    <v-navigation-drawer permanent app>
      <v-sheet class="pa-4 text-center">
        <v-avatar size="80">
          <v-img :src="account | identicon"></v-img>
        </v-avatar>
        <div v-if="account" class="font-weight-bold mt-2">{{ account | address }}</div>
      </v-sheet>
      <v-list>
        <v-list-item
          exact
          v-for="(nav,n) in navs"
          :to="nav.to"
          :key="n"
        >
          <v-list-item-title class="d-flex flex-row align-center">
            {{ nav.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-snackbar
      v-model="toast.show"
      :color="toast.color"
      app
      bottom
      transition="slide-y-reverse-transition"
      :right="!$vuetify.breakpoint.mobile"
      max-width="350"
      timeout="5000">
      <span class="font-weight-bold">{{ toast.msg }}</span>
      <span v-if="toast.info" class="d-block">{{ toast.info }}</span>
      <template v-slot:action="{ attrs }">
        <v-btn
          color="#fff"
          icon
          v-bind="attrs"
          @click="toast.show = false">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <loading :msg="loading.msg" :title="loading.title" v-model="loading.show" :persistent="loading.persistent"></loading>

    <ConnectWalletDialog v-model="connectDialog" persistent>
    </ConnectWalletDialog>
    <SwitchNetworkDialog v-model="networkDialog" persistent></SwitchNetworkDialog>
  </v-app>
</template>

<script>
import ConnectWalletDialog from '@/components/ConnectWalletDialog.vue';
import SwitchNetworkDialog from '@/components/SwitchNetworkDialog.vue';
import Loading from './components/Loading.vue';
import config from './config'

export default {
  name: 'App',
  components:{
    ConnectWalletDialog,
    SwitchNetworkDialog,
    Loading
  },
  data: () => ({
    account: '',
    connectDialog:false,
    networkDialog: false,
    navs: [
      {name: 'Create', to:{name:'home'}},
      {name: 'Contracts', to:{name:'contracts'}}
    ],
    toast: {
      show: false,
      msg: '',
      info: '',
      color: '#7a5ff4'
    },
    loading: {
      show: false,
      title: '',
      msg: '',
      persistent:false
    },
  }),
  mounted(){
    this.$bus.$on("appMsg", ({msg,info,color}) => {
      this.toast.msg = msg;
      this.toast.info = info
      this.toast.color = color?color:'#7a5ff4'
      this.toast.show = true
    });
    this.$bus.$on("showLoading", ({title,msg,persistent}) => {
      this.loading = {
        show: true,
        title: title,
        msg: msg,
        persistent: persistent
      }
    });
    this.$bus.$on("hideLoading", () => {
      this.loading = {
        show: false,
        title: '',
        msg: '',
        persistent: false
      }
    });

    this.$bus.$on("walletConnect", (account) => {
      this.connectDialog = false
      this.account = account;
      this.$store.dispatch("accountChange", {
        account: account
      });
    });
    this.$bus.$on("networkConnect", (newNetwork) => {
      
    });
    this.$chain.on("network", (newNetwork, oldNetwork)=>{
      if (newNetwork.chainId != config.chain.chainId) {
        this.networkDialog = true
      }else{
        this.networkDialog = false
      }
      if (oldNetwork) {
        this.$bus.$emit("networkConnect", newNetwork)
        window.location.reload();
      }
    })
    this.$chain.provider().provider.on("accountsChanged", (accounts)=>{
      this.$bus.$emit("walletConnect", accounts[0])
    })
    if(this.$store.getters.isLogin){
      this.$bus.$emit("walletConnect", this.$store.state.account)
    }
    this.tryGetAccount()
  },
  methods:{
    tryGetAccount(){
      this.$chain.signer().then(signer => {
        this.$bus.$emit("walletConnect", signer)
      }).catch(error => {
        this.connectDialog = true
      })
    },
    connectWallet(){
      this.$chain.requestAccount().then(accounts => {
        if(accounts.length>0){
          this.$bus.$emit("walletConnect", accounts[0])
          this.account = accounts[0]
        }
      })
    },
  }
};
</script>
