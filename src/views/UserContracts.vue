<template>
  <v-container>
    <v-card flat>
      <v-card-title class="primary-text">Contracts</v-card-title>
      <v-card-text>
        <v-simple-table class="ba">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Name
                </th>
                <th class="text-left">
                  Status
                </th>
                <th class="text-left">
                  Storage
                </th>
                <th class="text-left">
                  Modified
                </th>
                <th class="text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item,n) in contracts"
                :key="n"
              >
                <td>{{ item.name }}</td>
                <td>
                  <span v-if="item.signCompleted">Done</span>
                  <span v-else>{{ item.isSigner?'Pending Signature':'Pending' }}</span>
                </td>
                <td>IPFS</td>
                <td>{{ item.updateAt*1000 | datetime}}</td>
                <td class="text-right">
                  <v-btn depressed color="primary" small 
                    @click="gotoSign(item)"
                    class="text-none gradient-bg">
                    Sign
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <!-- <v-divider></v-divider> -->
        <v-pagination
          class="mt-4"
          color="#2B6EF1"
          v-model="page"
          :length="pageCount"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data:() => ({
    contracts:[],
    allContracts: [],
    page: 1,
    pageCount: 1,
    pageSize: 10,
  }),
  mounted(){
    this.$bus.$on("walletConnect", (account) => {
      this.queryData()
    });
    this.queryData()
  },
  watch:{
    page(){
      this.contracts = this.allContracts.slice((this.page-1)*this.pageSize,this.page*this.pageSize)
    }
  },
  methods:{
    gotoSign(item){
      this.$router.push({name:'sign',query:{id:item.id}})
    },
    queryData(){
      if(!this.$store.getters.isLogin){
        return
      }

      const account = this.$store.state.account
      this.$chain.sign().getAccountContracts(account).then(contracts => {
        this.allContracts = contracts.map(item => {
          let accountSigned = {}
          for (let i = 0; i < item.signed.length; i++) {
            accountSigned[item.signed[i].toLowerCase()] = true
          }

          let isSigner = false
          for (let i = 0; i < item.signers.length; i++) {
            if(item.signers[i].toLowerCase() == account.toLowerCase())
            isSigner = true
            break
          }
          let signed = accountSigned[account.toLowerCase()]?accountSigned[account.toLowerCase()]:false
          
          let signCompleted = true
          for (let i = 0; i < item.signers.length; i++) {
            if(!accountSigned[item.signers[i].toLowerCase()]){
              signCompleted = false
              break
            }
          }

          return {
            ...item,
            isSigner: isSigner,
            signed: signed,
            signCompleted: signCompleted,
            updateAt: item.updateAt.toNumber()
          }
        }).reverse()

        this.pageCount = Math.ceil(this.allContracts.length/this.pageSize)

        this.contracts = this.allContracts.slice(0,this.pageSize)
      })
    }
  }
}
</script>