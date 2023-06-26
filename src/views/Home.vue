<template>
  <v-container>
    <v-card depressed elevation="0">
      <v-stepper non-linear v-model="step" flat class="px-0">
        <v-stepper-header class="elevation-0">
          <v-stepper-step
            :complete="step > 1"
            step="1"
            color="#45BBFF"
          >
            <span :class="step > 0?'primary-text':''">Upload Document</span>
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step
            :complete="step > 2"
            step="2"
            color="#45BBFF"
          >
            <span :class="step > 1?'primary-text':''">Manage Recipients</span>
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step step="3"
            :complete="step > 3"
            color="#45BBFF">
            <span :class="step > 2?'primary-text':''">Prepare Documents</span>
          </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step step="4"
            :complete="step > 4"
            color="#45BBFF">
            <span :class="step > 3?'primary-text':''">Review and Send</span>
          </v-stepper-step>

        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <UploadDocs @onNext="onNext" @onFileChange="onFileChange" @onStorageChanged="onStorageChanged"></UploadDocs>
          </v-stepper-content>
          <v-stepper-content step="2">
            <ManageRecipients @onNext="onNext" @onBack="onBack" @receipientChanged="onReceipientChanged"></ManageRecipients>
          </v-stepper-content>
          <v-stepper-content step="3">
            <PrepareDocs v-if="step==3" :file="docFile" :fields="signFields" :recipients="recipients" @onSignFieldsChanged="onSignFieldsChanged" @onNext="onNext" @onBack="onBack"></PrepareDocs>
          </v-stepper-content>
          <v-stepper-content step="4">
            <ReceiveSend :file="docFile" :recipients="recipients" 
              @onContractNameChanged="onContractNameChanged"
              @onPasswordChanged="onPasswordChanged"
              @onBack="onBack" @onSend="onSend"></ReceiveSend>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>
    <v-snackbar
      v-model="showSnack"
      app
      right
      bottom
      timeout="-1"
      color="#F3F5FA"
      light
      transition="slide-y-reverse-transition"
      content-class="pa-0"
      max-width="400">
      <div class="text-subtitle-1 px-4 py-3">
        <div class="font-weight-bold d-flex flex-row align-center">
          <span>Uploading Contract</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="showSnackDetail=!showSnackDetail" class="mr-n2">
            <v-icon color="#2B6EF1">mdi-chevron-down</v-icon>
          </v-btn>
        </div>
        <div v-if="showSnackDetail">
          <div class="d-flex flex-row align-center pt-3">
            <span>Uploading to IPFS</span>
            <v-spacer></v-spacer>
            <v-progress-circular
              v-if="isUploadingFile"
              size="20"
              width="2"
              indeterminate
            ></v-progress-circular>
            <v-checkbox v-else v-model="uploadComplete" readonly hide-details class="mt-0 pt-0" style="width:24px;height:24px;"></v-checkbox>
          </div>
          <div class="d-flex flex-row align-center pt-3">
            <span>Waiting for block confirmations</span>
            <v-spacer></v-spacer>
            <v-progress-circular
              v-if="isWaitingConfirm"
              size="20"
              width="2"
              indeterminate
            ></v-progress-circular>
            <v-checkbox v-else v-model="blockConfirmed" readonly hide-details class="mt-0 pt-0" style="width:24px;height:24px;"></v-checkbox>
          </div>
        </div>
        
      </div>
    </v-snackbar>
  </v-container>
</template>

<script>

import gnfd from "@/utils/gnfd"
import utils from "@/utils/utils"
import { ethers } from "ethers"
import UploadDocs from '@/components/UploadDocs.vue';
import ManageRecipients from '@/components/ManageRecipients.vue';
import PrepareDocs from '@/components/PrepareDocs.vue';
import ReceiveSend from '@/components/ReceiveSend.vue';

export default {
  components:{
    UploadDocs,
    ManageRecipients,
    PrepareDocs,
    ReceiveSend
  },
  data:()=>({
    step: 1,
    storage: { name: 'IPFS',value:'ipfs' },
    showSnack: false,
    showSnackDetail: true,
    uploadComplete: false,
    blockConfirmed: false,
    isUploadingFile: false,
    isWaitingConfirm: false,
    snackMsg: '',
    account: '',
    prepareDocs:false,
    docFile: null,
    recipients: [],
    signFields: [],
    contractName: '',
    password: ''
  }),
  mounted(){
    // this.queryGNFD()
  },
  methods:{
    onFileChange(file){
      this.docFile = file
    },
    onStorageChanged(storage){
      this.storage = storage
    },
    onBack(){
      if (this.step>1) {
        this.step -= 1
      }
    },
    onNext(){
      if (this.step <= 3) {
        this.step += 1
      }
    },
    onContractNameChanged(name){
      this.contractName = name
    },
    onPasswordChanged(password){
      this.password = password
    },
    onSend(){
      const contractName = this.contractName?this.contractName:this.docFile.name
      this.uploadComplete = false
      this.blockConfirmed = false
      this.showSnack = true
      this.showSnackDetail = true
      this.isUploadingFile = true
      
      this.$api.createStore({
        file: this.docFile,
        type: this.storage.value,
        owner: this.$store.state.account
      }).then(async resp => {
        

        const txhash = resp.data.txhash
        const receipt = await this.$chain.provider().waitForTransaction(txhash)
        const topic = this.$chain.store().filters.CreateStore().topics[0]
        const logs = receipt.logs.filter(log => {
                      return log.topics[0] == topic
                    }).map(log => {
                      return this.$chain.store().interface.parseLog(log)
                    });
        const storeId = logs[0].args.id
        const fields = this.signFields.map(f => {
          return {
            page: f.page,
            account: f.address,
            field: f.field,
            x: f.x,
            y: f.y,
            signature: ''
          }
        })

        const signers = this.recipients.filter(r => r.type=='signer').map(r => r.address)
        const viewers = this.recipients.filter(r => r.type=='viewer').map(r => r.address)
        
        this.isUploadingFile = false
        this.uploadComplete = true
        this.isWaitingConfirm = true
        await this.$chain.sign().connect(this.$chain.provider().getSigner()).mint(
          this.$store.state.account,
          contractName,
          signers,
          viewers,
          storeId,
          fields
        ).then(tx => tx.wait())
        this.blockConfirmed = true
        this.isWaitingConfirm = false
        this.$router.push({name: 'contracts'})
      }).catch(e => {
        console.log(e)
      }).finally(() => {
        this.isUploadingFile = false
        this.isWaitingConfirm = false
      })
    },
    onSignFieldsChanged(signFields){
      this.signFields = signFields
    },
    onReceipientChanged(e){
      this.recipients = [
        ...e.signers.map(signer => ({
          address: signer,
          type: 'signer'
        })),
        ...e.viewers.map(viewer => ({
          address: viewer,
          type: 'viewer'
        }))
      ]
    },
    async doGNFD(){
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
  }
}
</script>
