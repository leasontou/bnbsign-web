<template>
  <div>
    <div class="primary-text text-h6">Review and Send</div>

    <div class="mt-6">
      <div class="primary-text font-weight-bold">Added Recipients</div>
      <div class="mt-3">
        <v-row>
          <v-col cols="4" v-for="(item,n) in recipients" :key="n">
            <div class="pa-3 mb-3 ba rounded d-flex flex-row align-center">
              <v-avatar size="40">
                <v-img :src="item.address | identicon"></v-img>
              </v-avatar>
              <span class="ml-2">{{ item.address | hash(8,8) }}</span>
              <v-spacer></v-spacer>
              <div>
                <v-icon v-if="item.type=='signer'">mdi-fountain-pen-tip</v-icon>
                <v-icon v-else-if="item.type=='viewer'">mdi-eye</v-icon>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-divider class="my-6"></v-divider>
    <div>
      <div class="primary-text font-weight-bold">Settings</div>
      <v-row class="mt-3" dense>
        <v-col cols="6" class="d-flex flex-row align-center">
          <div class="mr-2">Contract Name:</div>
          <v-text-field
            v-model="contractName"
            hide-details
            dense
            outlined
            placeholder="contractName"
          >
          </v-text-field>
        </v-col>
        <!-- <v-col cols="6" class="d-flex flex-row align-center">
          <div class="mr-2">Password Protection:</div>
          <v-text-field
            v-model="password"
            hide-details
            dense
            outlined
            placeholder="Password"
          >
          </v-text-field>
        </v-col> -->
      </v-row>
    </div>

    <div class="mt-6">
      <div class="d-flex flex-row">
        <v-spacer></v-spacer>
        <v-btn dark @click="back" depressed class="text-none border-btn px-6 primary-text">Back</v-btn>
        <v-btn dark @click="send" depressed class="text-none ml-4 px-6 gradient-bg">Send</v-btn>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  props:[
    "file","recipients"
  ],
  data:()=>({
    contractName: '',
    password: ''
  }),
  mounted(){
    const contractName = this.file?this.file.name:''
    const i = contractName.lastIndexOf('.')
    this.contractName = contractName.substring(0,i)
  },
  watch:{
    file(newVal){
      const contractName = this.file?this.file.name:''
      const i = contractName.lastIndexOf('.')
      this.contractName = contractName.substring(0,i)
    },
    contractName(){
      this.$emit('onContractNameChanged', this.contractName)
    },
    password(){
      this.$emit('onPasswordChanged', this.password)
    }

  },
  methods:{
    back(){
      this.$emit('onBack')
    },
    send(){
      this.$emit('onSend')
    }
  }
}
</script>