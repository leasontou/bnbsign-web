<template>
  <v-container>
    <v-card depressed elevation="0">
      <v-card-title>Contract Name</v-card-title>
      <v-card-text>
        <v-text-field dense outlined v-model="contractName" label="Contract Name"
          hide-details></v-text-field>
      </v-card-text>
      <v-card-title>Upload Contract</v-card-title>
      <v-card-text>
        <div v-if="selectedFiles.length==0" class="pa-4 rounded d-flex flex-column align-center justify-center" style="background: #F3F5FA;border: 1px dashed #000000;height: 200px;">
          <v-btn depressed color="primary" class="text-none" @click="selectFile">Browse Files</v-btn>
          <input 
            ref="uploader" 
            class="d-none" 
            type="file" 
            accept=".pdf"
            @change="onFileChanged"
          >
        </div>
        <div v-else>
          <div class="d-flex flex-row">
            <v-text-field dense outlined v-model="signer" label="Add Signer"
              hide-details></v-text-field>
            <v-btn depressed class="text-none ml-1" @click="addSigner" color="primary">Add</v-btn>
          </div>
          
        </div>
        
        <v-list dense v-if="selectedFiles.length>0">
          <v-subheader class="text-h6 px-0">Signers:</v-subheader>
          <v-list-item
            v-for="(address,n) in signers"
            :key="n"
          >
            <v-list-item-title class="d-flex flex-row align-center">
              <span>{{ address }}</span>
              <v-btn icon class="ml-2" @click="deleteSigner(n)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-list-item-title>
            <v-spacer></v-spacer>
          </v-list-item>
        </v-list>

        <!-- <v-row class="mt-3" v-if="selectedFiles.length>0 && signers.length>0">
          <v-col cols="3">
            <v-btn depressed block class="text-none" :to="{name:'sign'}">Sign File</v-btn>
          </v-col>
        </v-row> -->
      </v-card-text>
      
      <v-card-title>Uploaded Contracts</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6" v-for="(f,n) in selectedFiles" :key="n">
            <div class="d-flex flex-row align-center ba pa-4 rounded">
              <img src="../assets/img/common/pdf.png" width="60" class="mr-4">
              <div>
                <span class="text-h6 d-block">{{ f.name }}</span>
                <span>{{ calcFileSize(f.size) }}</span>
              </div>
              <v-spacer></v-spacer>
              <v-btn icon @click="onFileDelete(n)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
        
        <!-- <vue-pdf-embed v-if="selectedFiles.length>0" 
          :source="pdfURI">
        </vue-pdf-embed> -->
      </v-card-text>
      
      <v-card-text>
        <v-btn @click="next" :disabled="!contractName || selectedFiles.length==0 || signers.length==0" depressed color="primary" class="text-none">Next</v-btn>
      </v-card-text>
    </v-card>
    <v-snackbar
      v-model="showSnack"
      color="primary"
      app
      bottom
      timeout="-1"
      transition="slide-y-reverse-transition"
      max-width="350">
      <span class="font-weight-bold">{{ snackMsg }}</span>
      <template v-slot:action="{ attrs }">
        <v-progress-circular
          :size="20"
          :width="2"
          indeterminate
          v-bind="attrs"
          color="#fff"
        ></v-progress-circular>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>

import gnfd from "@/utils/gnfd"
import utils from "@/utils/utils"
import { ethers } from "ethers"

export default {
  name: 'Home',
  data:()=>({
    contractName: '',
    signer: '',
    showSnack: false,
    snackMsg: '',
    signers: ["0xc4D1Ae24FbDBA2eF9969b0a1e452AaDBbBDe8DB8"],
    account: '',
    isSelecting: false,
    selectedFiles: [],
    loadingTask: null,
    numPages: null,
  }),
  mounted(){
    // this.queryGNFD()
  },
  methods:{
    addSigner(){
      if(!ethers.utils.isAddress(this.signer)){
        return
      }
      const signers = [...new Set([...this.signers,this.signer])]
      this.signers = signers
      this.signer = ''
    },
    deleteSigner(n){
      this.signers.splice(n,1)
    },
    async next(){
      this.showSnack = true
      this.snackMsg = 'Get Bucket Info'
      const account = this.$store.state.account
      const bucketName = account.toLowerCase()
      const bucketExist = await gnfd.bucket.headBucket(bucketName).catch(error => {

      })
      console.log(bucketExist)
      if(!bucketExist){
        this.snackMsg = 'Create Bucket'
        const bucketRes = await this.createBucket(bucketName).finally(() => {
          this.showSnack = false
          this.snackMsg = ''
        })
        if(!bucketRes){
          return
        }
      }
      
      const spInfo = await gnfd.selectSp()
      const objectName = utils.guid()
      const createObjectInfo = {
        bucketName: bucketName,
        objectName: objectName+'.pdf'
      }
      const file = this.selectedFiles[0]
      this.showSnack = true
      this.snackMsg = 'Create Object'
      const res = await gnfd.object.createObject(
        {
          bucketName: createObjectInfo.bucketName,
          objectName: createObjectInfo.objectName,
          spInfo,
          file,
          creator: account,
          expectSecondarySpAddresses: [],
        },
        {
          simulate: false,
          denom: 'BNB',
          gasLimit: 210000,
          gasPrice: '5000000000',
          payer: account,
          granter: '',
        },
      );

      this.snackMsg = 'Upload Object'
      const uploadRes = await gnfd.object.uploadObject({
        bucketName: createObjectInfo.bucketName,
        objectName: createObjectInfo.objectName,
        body: file,
        txnHash: res.transactionHash,
        endpoint: spInfo.endpoint,
      });

      if (uploadRes.code === 0) {
        this.snackMsg = 'Upload Success'
        this.$api.createContract({
          txhash: res.transactionHash,
          creator: account,
          name: this.contractName,
          bucket: createObjectInfo.bucketName,
          objectName: createObjectInfo.objectName,
          signers: this.signers
        }).then(resp => {
          this.$router.push({
            name: 'contracts'
          })
        })
      }else{
        this.snackMsg = 'Upload Failed'
      }
      this.showSnack = false
    },
    connectWallet(){
      this.$chain.requestAccount().then(accounts => {
        if(accounts.length>0){
          this.account = accounts[0]
        }
      })
    },
    async downloadFile(){
      const spInfo = await gnfd.selectSp()
      await gnfd.object.downloadFile({
        bucketName: "onnoman",
        objectName: "bitcoin.pdf",
        endpoint: spInfo?.endpoint
      })
    },
    async createBucket(bucketName){
      const account = this.$store.state.account
      const txOption = {
        denom: 'BNB',
        gasLimit: 210000,
        gasPrice: '5000000000',
        payer: account,
        granter: '',
      }

      const spInfo = await gnfd.selectSp()
      const approve = await gnfd.bucket.getCreateBucketApproval({
        bucketName: bucketName,
        creator: account,
        visibility:'VISIBILITY_TYPE_PUBLIC_READ',
        chargedReadQuota: '0',
        spInfo:spInfo
      },{
        ...txOption,
        simulate: true,
      })
      console.log(approve)
      const resp = await gnfd.bucket.createBucket({
        bucketName: bucketName,
        creator: account,
        visibility:'VISIBILITY_TYPE_PUBLIC_READ',
        chargedReadQuota: '0',
        spInfo:spInfo
      },txOption)
      if (resp.code === 0) {
        // alert('success');
        return true
      }else{
        return false
      }
    },
    async createObject(){
      const spInfo = await gnfd.selectSp()
      
      const createObjectInfo = {
        bucketName: 'onnoman',
        objectName: 'bitcoin.pdf'
      }
      const file = this.selectedFiles[0]
      const res = await gnfd.object.createObject(
        {
          bucketName: createObjectInfo.bucketName,
          objectName: createObjectInfo.objectName,
          spInfo,
          file,
          creator: this.account,
          expectSecondarySpAddresses: [],
        },
        {
          simulate: false,
          denom: 'BNB',
          gasLimit: 210000,
          gasPrice: '5000000000',
          payer: this.account,
          granter: '',
        },
      );

      const uploadRes = await gnfd.object.uploadObject({
        bucketName: createObjectInfo.bucketName,
        objectName: createObjectInfo.objectName,
        body: file,
        txnHash: res.transactionHash,
        endpoint: spInfo.endpoint,
      });
      console.log('uploadRes', uploadRes);

      if (uploadRes.code === 0) {
        alert('success');
      }
    },
    async queryGNFD(){
      const sps = await gnfd.sp.getStorageProviders();
      console.log(sps)
      const finalSps = (sps ?? []).filter((v) => v?.description?.moniker !== 'QATest');
      const selectIndex = 0;
      const secondarySpAddresses = [
        ...finalSps.slice(0, selectIndex),
        ...finalSps.slice(selectIndex + 1),
      ].map((item) => item.operatorAddress);
      console.log(secondarySpAddresses)

      const bucket = await gnfd.bucket.headBucket("fucker")
      console.log(bucket)
    },
    calcFileSize(filesize){
      var size = "";
      if(filesize < 0.1 * 1024){                         //小于0.1KB，则转化成B
          size = filesize.toFixed(2) + "B"
      }else if(filesize < 0.1 * 1024 * 1024){            //小于0.1MB，则转化成KB
          size = (filesize/1024).toFixed(2) + "KB"
      }else if(filesize < 0.1 * 1024 * 1024 * 1024){     //小于0.1GB，则转化成MB
          size = (filesize/(1024 * 1024)).toFixed(2) + "MB"
      }else{                                            //其他转化成GB
          size = (filesize/(1024 * 1024 * 1024)).toFixed(2) + "GB"
      }
      var sizeStr = size + "";                        //转成字符串
      var index = sizeStr.indexOf(".");                    //获取小数点处的索引
      var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
      if(dou == "00"){                                //判断后两位是否为00，如果是则删除00
          return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
      }
      return size;
    },
    createURI(file){
      var uri = window.URL.createObjectURL(file)
      return uri
    },
    // loadPage(src){
    //   var loadingTask = pdf.createLoadingTask('https://cdn.mozilla.net/pdfjs/tracemonkey.pdf');
    // },
    selectFile(){
      this.isSelecting = true;
      window.addEventListener('focus', () => {
        this.isSelecting = false
      }, { once: true });
      
      this.$refs.uploader.click();
    },
    onFileChanged(e) {
      const files = e.target.files
      this.selectedFiles.push(...files)
      // var loadingTask = pdf.createLoadingTask(this.createURI(this.selectedFiles[0]));
      // loadingTask.promise.then(pdf => {
      //   this.numPages = pdf.numPages;
      // });
      // this.loadingTask = loadingTask
    },
    onFileDelete(i){
      this.selectedFiles.splice(i,1)
    }
  }
}
</script>
