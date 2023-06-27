<template>
  <div>
    <div class="primary-text text-h6 d-flex flex-row align-center">
      <span>Upload Contract</span>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <div
            class="border-btn text-body-2 pl-3 pr-1 py-1 rounded ml-3 d-flex flex-row align-center"
            style="width:150px;"
            v-bind="attrs"
            v-on="on">
            <span>{{storage.name}}</span>
            <v-spacer></v-spacer>
            <v-icon color="#2B6EF1">mdi-chevron-down</v-icon>
          </div>
        </template>
        <v-list class="py-0">
          <v-list-item @click="changeStorage(item)" v-for="(item,n) in storeTypes" :key="n">
            <v-list-item-title>{{item.name}}</v-list-item-title>
            <v-list-item-icon v-if="item.disabled">
              <v-icon size="20" color="#2B6EF1">mdi-lock</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div class="pa-4 rounded mt-3 d-flex flex-column align-center justify-center" style="background: #F3F5FA;border: 1px dashed #2B6EF1;height: 200px;">
      <v-btn depressed color="primary" class="text-none gradient-bg" @click="selectFile">Browse Files</v-btn>
      <input 
        ref="uploader" 
        class="d-none" 
        type="file" 
        accept=".pdf"
        @change="onFileChanged"
      >
    </div>
    
    <div class="primary-text text-h6 mt-6">Uploaded Contracts</div>
    <div class="mt-3">
      <v-row v-if="selectedFile">
        <v-col  cols="6">
          <div class="d-flex flex-row align-center ba pa-4 rounded">
            <img src="../assets/img/common/pdf.png" width="60" class="mr-4">
            <div>
              <span class="text-h6 d-block">{{ selectedFile.name }}</span>
              <span>{{ calcFileSize(selectedFile.size) }}</span>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon @click="onFileDelete()">
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <div v-else class="text-center py-10 grey--text">
        There are no contracts uploaded yet!
      </div>
    </div>

    <div class="mt-6">
      <div class="d-flex flex-row">
        <v-spacer></v-spacer>
        <v-btn dark @click="next" :disabled="!selectedFile" depressed class="text-none ml-4 px-6 gradient-bg">
          <span>{{ uploading?'Uploading': 'Next' }}</span>
          <v-progress-circular v-if="uploading" class="ml-2" indeterminate color="white" size="18" width="2"></v-progress-circular>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "@/utils/utils"

export default {
  data:()=>({
    signer: '',
    account: '',
    storeTypes: [
      { name: 'IPFS',value:'ipfs'},
      { name: 'Greenfield',value:'greenfield',disabled:true  },
      { name: 'Arweave',value:'arweave',disabled:true  }
    ],
    storage: { name: 'IPFS',value:'ipfs' },
    isSelecting: false,
    selectedFile: null,
    uploading: false
  }),
  methods:{
    changeStorage(item){
      if (item.disabled) {
        return
      }
      this.storage = item
      this.$emit('onStorageChanged', item)
    },
    calcFileSize(size){
      return utils.calcFileSize(size)
    },
    selectFile(){
      this.isSelecting = true;
      window.addEventListener('focus', () => {
        this.isSelecting = false
      }, { once: true });
      
      this.$refs.uploader.click();
    },
    onFileChanged(e) {
      const files = e.target.files
      this.selectedFile = files[0]
      this.$emit('onFileChange',this.selectedFile)
      // this.selectedFiles.push(...files)
    },
    onFileDelete(){
      this.selectedFile = null
    },
    next(){
      this.$emit('onNext')
      // if(this.uploading){
      //   return
      // }
      // this.uploading = true
      // this.$api.createStore({
      //   file: this.selectedFile,
      //   type: this.storage.value,
      //   owner: this.$store.state.account
      // }).then(resp => {
      //   this.$emit('onNext')
      // }).finally(() => {
      //   this.uploading = false
      // })
    }
  }
}
</script>