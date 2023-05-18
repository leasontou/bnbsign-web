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
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    account: '',
    navs: [
      {name: 'Create', to:{name:'home'}},
      {name: 'Contracts', to:{name:'contracts'}}
    ]
  }),
  mounted(){
    this.$bus.$on("walletConnect", (account) => {
      this.account = account;
      this.$store.dispatch("accountChange", {
        account: account
      });
    });
    this.$bus.$on("networkConnect", (newNetwork) => {
      
    });
    this.$chain.provider().provider.on("accountsChanged", (accounts)=>{
      this.$bus.$emit("walletConnect", accounts[0])
    })
    if(this.$store.getters.isLogin){
      this.$bus.$emit("walletConnect", this.$store.state.account)
    }
    this.connectWallet()
  },
  methods:{
    tryGetAccount(){
      this.$chain.signer().then(signer => {
        this.$bus.$emit("walletConnect", signer)
      }).catch(error => {
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
