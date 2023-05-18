<template>
  <v-container>
    <v-tabs>
      <v-tab>My Create</v-tab>
      <v-tab>My Sign</v-tab>
      <v-tab-item>
        <v-list>
          <v-list-item
            v-for="(item,n) in createContracts"
            :to="{name:'sign',query:{id:item.id}}"
            :key="n"
          >
            <v-list-item-title class="d-flex flex-row align-center">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-tab-item>
      <v-tab-item>
        <v-list>
          <v-list-item
            v-for="(item,n) in signContracts"
            :to="{name:'sign',query:{id:item.id}}"
            :key="n"
          >
            <v-list-item-title class="d-flex flex-row align-center">
              {{ item.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
export default {
  data:() => ({
    createContracts: [],
    signContracts: []
  }),
  mounted(){
    this.$bus.$on("walletConnect", (account) => {
      this.queryData()
    });
    this.queryData()
  },
  methods:{
    queryData(){
      if(!this.$store.getters.isLogin){
        return
      }

      this.$api.userContracts(this.$store.state.account).then(resp => {
        this.createContracts = resp.data.create
        this.signContracts = resp.data.sign
      })
    }
  }
}
</script>