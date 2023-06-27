<template>
  <div>
    <div class="primary-text text-h6">Manage Recipients</div>
    <div class="mt-3">
      <v-btn class="text-none border-btn primary-text" depressed @click="addSelf">
        <v-icon>mdi-plus</v-icon>
        Add Myself
      </v-btn>
    </div>

    <div class="d-flex flex-row mt-3 align-center">
      <v-text-field dense outlined v-model="signer" placeholder="Wallet Address"
        hide-details></v-text-field>
      <v-btn depressed class="text-none ml-3 gradient-bg px-6" color="primary" @click="addSigner">Add</v-btn>
    </div>

    <div class="primary-text font-weight-bold mt-10">Recipients</div>
    <div class="mt-3">
      <v-row>
        <v-col cols="6">
          <div class="d-flex flex-row align-center mb-3">
            <span class="grey--text">Signers</span>
            <div class="divider ml-1"></div>
          </div>
          <div v-if="signers">
            <div v-for="(item,n) in signers" :key="n" class="pa-3 mb-3 ba rounded d-flex flex-row align-center">
              <v-avatar size="40">
                <v-img :src="item | identicon"></v-img>
              </v-avatar>
              <span class="ml-2">{{ item | hash(8,8) }}</span>
              <v-spacer></v-spacer>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="border-btn text-none pr-2"
                    depressed
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>Signer</span>
                    <v-icon color="#2B6EF1" class="ml-2">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list class="py-0">
                  <v-list-item @click="changeSigner(n)">
                    <v-list-item-title>Viewer</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn icon @click="deleteSigner(n)" class="ml-2">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-else class="text-center py-16">
            <span class="grey--text">No signer has been added yet</span>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="d-flex flex-row align-center mb-3">
            <span class="grey--text">Viewers</span>
            <div class="divider ml-1"></div>
          </div>
          <div v-if="viewers">
            <div v-for="(item,n) in viewers" :key="n" class="pa-3 mb-3 ba rounded d-flex flex-row align-center">
              <v-avatar size="40">
                <v-img :src="item | identicon"></v-img>
              </v-avatar>
              <span class="ml-2">{{ item | hash(8,8) }}</span>
              <v-spacer></v-spacer>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="border-btn text-none pr-2"
                    depressed
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>Viewer</span>
                    <v-icon color="#2B6EF1" class="ml-2">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list class="py-0">
                  <v-list-item @click="changeViewer(n)">
                    <v-list-item-title>Signer</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn icon @click="deleteViewer(n)" class="ml-2">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-else class="text-center py-16">
            <span class="grey--text">No viewer has been added yet</span>
          </div>
        </v-col>
      </v-row>
    </div>

    <div class="mt-6">
      <div class="d-flex flex-row">
        <v-spacer></v-spacer>
        <v-btn dark @click="back" depressed class="text-none border-btn px-6 primary-text">Back</v-btn>
        <v-btn dark @click="next" :disabled="!signers || signers.length==0" depressed class="text-none ml-4 px-6 gradient-bg">Next</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers"

export default {
  data: () => ({
    signer: '',
    signers: [],
    viewers: [],
  }),
  methods:{
    back(){
      this.$emit('onBack')
    },
    next(){
      this.$emit('onNext')
    },
    addSelf(){
      const signers = [...new Set([...this.signers,this.$store.state.account])]
      this.signers = signers

      this.emitReceipientChange()
    },
    addSigner(){
      if(!ethers.utils.isAddress(this.signer)){
        return
      }
      const signers = [...new Set([...this.signers,this.signer])]
      this.signers = signers
      this.signer = ''

      this.emitReceipientChange()
    },
    changeSigner(n){
      const signer = this.signers[n]
      this.deleteSigner(n)
      const viewers = [...new Set([...this.viewers,signer])]
      this.viewers = viewers

      this.emitReceipientChange()
    },
    deleteSigner(n){
      this.signers.splice(n,1)

      this.emitReceipientChange()
    },
    addViewer(viewer){
      if(!ethers.utils.isAddress(viewer)){
        return
      }
      const viewers = [...new Set([...this.viewers,viewer])]
      this.viewers = viewers

      this.emitReceipientChange()
    },
    deleteViewer(n){
      this.viewers.splice(n,1)

      this.emitReceipientChange()
    },
    changeViewer(n){
      const viewer = this.viewers[n]
      this.deleteViewer(n)
      const signers = [...new Set([...this.signers,viewer])]
      this.signers = signers

      this.emitReceipientChange()
    },
    emitReceipientChange(){
      this.$emit('receipientChanged',{
        signers: this.signers,
        viewers: this.viewers
      })
    }
  }
}
</script>