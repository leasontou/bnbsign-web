<template>
  <v-container>
    <vue-pdf-embed
      v-if="fileURL"
      :source="fileURL">
    </vue-pdf-embed>
    <div v-else style="width: 100%;height: 100vh;" class="d-flex flex-row align-center justify-center">
      <v-progress-circular
        :size="150"
        :width="2"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    
    <v-btn large v-if="fileURL && isSigner" class="text-none rounded-pill" depressed color="primary" 
      @click="signFile"
      style="position: fixed;bottom: 40px;left: 50%;right: 50%;width: 100px;z-index: 20;">
      {{ signed? 'Signed': 'Sign' }}
    </v-btn>
  </v-container>
</template>

<script>
import gnfd from "@/utils/gnfd"
import utils from "@/utils/utils"
const download = require("downloadjs")
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default {
  data:()=>({
    file: null,
    fileURL: '',
    isSigner: false,
    signed: false,
    signers: []
  }),
  mounted(){
    this.getSignFile()
  },
  methods:{
    async getSignFile(){
      const contractid = this.$route.query.id
      const res = await this.$api.contractInfo(contractid)
      const contract = res.data.contract
      const signers = res.data.signers
      this.signers = signers
      for (let i = 0; i < this.signers.length; i++) {
        const signer = this.signers[i];
        if(signer.address.toLowerCase() == this.$store.state.account.toLowerCase()){
          this.isSigner = true
          this.signed = signer.state == 'signed'
        }
      }

      const spInfo = await gnfd.selectSp()
      const getObjectResult = await gnfd.object.getObject({
        bucketName: contract.bucket,
        objectName: contract.objectName,
        endpoint: spInfo?.endpoint
      })
      if (getObjectResult.code !== 0) {
        console.log('error:'+getObjectResult.code)
        return
      }
      const file = getObjectResult?.body;
      this.file = file
      if (file) {
        const fileURL = URL.createObjectURL(file);
        this.fileURL = fileURL
      }
    },
    async signFile(){
      if(!this.$store.getters.isLogin || !this.isSigner || this.signed){
        return
      }

      let signerIndex = 0
      for (let i = 0; i < this.signers.length; i++) {
        const signer = this.signers[i];
        if(signer.address.toLowerCase() == this.$store.state.account.toLowerCase()){
          signerIndex = i
        }
      }

      const arrayBuffer = await new Response(this.file).arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]
      const signText = `Signed by ${this.$store.state.account}`
      const { width, height } = firstPage.getSize()
      firstPage.drawText(signText, {
        x: 5,
        y: height-20-signerIndex*20,
        size: 10,
        color: rgb(0.95, 0.1, 0.1),
        // rotate: degrees(-45),
      })
      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save()
      // download(pdfBytes, "bitcoin-modify.pdf", "application/pdf");

      const account = this.$store.state.account
      const bucketName = account.toLowerCase()
      const bucketExist = await gnfd.bucket.headBucket(bucketName).catch(error => {

      })
      console.log(bucketExist)
      if(!bucketExist){
        const bucketRes = await this.createBucket(bucketName)
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
      const file = new Blob([pdfBytes.buffer]);

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

      const uploadRes = await gnfd.object.uploadObject({
        bucketName: createObjectInfo.bucketName,
        objectName: createObjectInfo.objectName,
        body: file,
        txnHash: res.transactionHash,
        endpoint: spInfo.endpoint,
      });

      console.log(uploadRes)
      if (uploadRes.code === 0) {
        const contractId = this.$route.query.id
        this.$api.signContract({
          account: account,
          id: contractId,
          bucket: createObjectInfo.bucketName,
          objectName: createObjectInfo.objectName
        }).then(resp => {
          console.log(resp)
          this.getSignFile()
        })
      }
    }
  }
}
</script>