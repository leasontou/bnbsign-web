<template>
  <div class="d-flex flex-row justify-center" style="position: relative;">
    <div style="flex:1;max-width: 900px;" class="py-2">
      <div v-for="i in numPages" :key="i" class="doc-page mb-2" 
        :ref="'page'+i"
        style="position: relative;">
        <pdf
          :src="src"
          :page="i"
          @page-loaded="onDocLoaded(i,$event)"
          style="display: inline-block; width: 100%">
        </pdf>
        <template v-for="(f,n) in signFields" v-if="f.page==i">
          <div
            v-if="pageLoadingCompleted"
            :style="`left:${f.x}px;top:${f.y}px;`"
            style="position: absolute;"
            @click="showSignDialog(n)"
            class="rounded sign-container pa-3 text-center pointer">
            <template v-if="!f.signature">
              <div v-if="f.field=='signature'">
                <inline-svg :src="require('../assets/img/common/signature.svg')" width="24" height="24"></inline-svg>
                <div>{{ f.account | hash }} Signature</div>
              </div>
              <div v-else-if="f.field=='wallet'">
                <v-icon color="#2B6EF1">mdi-wallet</v-icon>
                <div>{{ f.account | hash }}</div>
              </div>
            </template>
            <template v-else>
              <div v-if="f.field=='signature'">
                <div class="primary-text">BNBSigned By:</div>
                <div>{{ f.signature }}</div>
                <div>{{ f.account | hash(10,8) }}</div>
              </div>
              <div v-else-if="f.field=='wallet'">
                <v-icon color="#2B6EF1">mdi-wallet</v-icon>
                <div>{{ f.account | hash }}</div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <div v-if="!pageLoadingCompleted" 
      style="left:0;top:0;position: fixed;width: 100vw;height: 100vh;background: #fff;"
      class="d-flex flex-row align-center justify-center">
      <v-progress-circular
        :size="100"
        :width="2"
        indeterminate
        color="#895ff1"
      ></v-progress-circular>
    </div>

    <div style="position: fixed; bottom: 0;" class="py-10" v-if="!isSigned">
      <v-btn depressed :loading="waitingSign" dark class="text-none gradient-bg px-10" @click="uploadSign">Upload</v-btn>
    </div>

    <v-dialog v-model="signDialog" overlay-opacity="0.5" max-width="400">
      <div class="dialog-bg pa-4">
        <div v-if="pendingSignField.field=='signature'">
          <v-btn-toggle
            v-model="toggleSignType"
            class="d-flex"
            mandatory
          >
            <v-btn value="type" small class="text-none flex-grow-1">
              Type
            </v-btn>
            <v-btn value="draw" small class="text-none flex-grow-1">
              Draw
            </v-btn>
            <v-btn value="upload" small class="text-none flex-grow-1">
              Upload
            </v-btn>
          </v-btn-toggle>
          <div v-if="toggleSignType=='type'">
            <div class="mt-3">
              <v-text-field
                v-model="signatureTypeContent"
                hide-details
                dense
                outlined
              >
              </v-text-field>
            </div>
            <div class="pa-3 mt-3 ba">
              <div class="primary-text mb-3">BNBSigned By:</div>
              <div class="font-weight-bold d-flex flex-row align-center" style="height: 40px;">{{ signatureTypeContent }}</div>
              <div class="grey--text">{{ pendingSignField.account | hash }}</div>
            </div>
          </div>
          <div v-else-if="toggleSignType=='draw'">
            <div class="pa-3 mt-3 ba">
              <div class="primary-text mb-3">BNBSigned By:</div>
              <!-- <canvas style="width:100%;height: 200px;"></canvas> -->
              <canvas-broad 
                ref="signboard" 
                style="width:100%;height: 200px;" :toolsTabList = "true">
              </canvas-broad>
              <div class="d-flex flex-row align-center">
                <div class="grey--text">{{ pendingSignField.account | hash }}</div>
                <v-spacer></v-spacer>
                <v-icon color="grey" size="20" style="cursor:pointer;" @click="cleanBoard">mdi-trash-can-outline</v-icon>
              </div>
              
            </div>
          </div>
          <div v-else-if="toggleSignType=='upload'">
            <div class="pa-4 rounded mt-3 d-flex flex-column align-center justify-center" style="background: #F3F5FA;border: 1px dashed #2B6EF1;height: 200px;">
              <v-btn depressed color="primary" class="text-none gradient-bg" @click="selectFile">Browse File</v-btn>
              <input 
                ref="uploader" 
                class="d-none" 
                type="file" 
                accept=".png"
                @change="onFileChanged"
              >
            </div>
          </div>
          <v-btn depressed block dark class="text-none mt-3 gradient-bg" @click="insertSignature">Insert</v-btn>
        </div>
        <div v-else-if="pendingSignField.field=='wallet'">
          <v-icon color="#2B6EF1">mdi-wallet</v-icon>
          <div>{{ pendingSignField.account | hash }}</div>
        </div>
      </div>
    </v-dialog>

    <v-navigation-drawer permanent right app width="300">
      <div class="d-flex flex-column pa-2" style="height: 100%;">
        <div v-for="i in numPages" :key="i" class="mb-2 text-center" style="position: relative;">
          <pdf
            :src="src"
            :page="i"
            class="doc-page"
            style="display: inline-block;width: 80%;cursor: pointer; ">
          </pdf>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import CanvasBroad from '@/components/CanvasBroad'
// import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'

export default {
  components:{
    CanvasBroad,
  },
  data:()=>({
    signDialog: false,
    contractName: '',
    src: '',
    signFields: [],
    pendingSignField: {},
    pendingSignFieldIdx: 0,
    numPages: 0,
    signers: [],
    viewers: [],
    signedList: [],
    isSigned: true,
    storeType: '',
    storeUri: '',
    storeBucket: '',
    storeObject: '',
    toggleSignType: 'type',
    signatureTypeContent: '',
    waitingSign: false,
    pageLoadingCompleted: false
  }),
  mounted(){
    const id = this.$route.query.id
    this.loadDocs()
  },
  methods:{
    onDocLoaded(page,e){
      this.pageLoadingCompleted = true
      let fields = this.signFields
      for (let i = 0; i < fields.length; i++) {
        let field = fields[i]
        if(field.page == page){
          let ref = eval('this.$refs.page'+field.page)[0]
          let x = field.x*ref.offsetWidth/1000000
          let y = field.y*ref.offsetHeight/1000000
          field.x = x
          field.y = y
        }
      }
      this.signFields = fields
    },
    cleanBoard(){
      this.$refs.signboard.clear()
    },
    async uploadSign(){
      const id = this.$route.query.id
      let signatures = []
      for (let i = 0; i < this.signFields.length; i++) {
        let content = this.signFields[i].signature
        if(this.signFields[i].account.toLowerCase() == this.$store.state.account.toLowerCase()){
          signatures.push({
            idx: i,
            content: content
          })
        }
      }

      this.waitingSign = true
      await this.$chain.sign().connect(this.$chain.provider().getSigner()).sign(
        id,signatures
      ).then(async tx => {
        await tx.wait()
        this.isSigned = true
      }).catch(e => {
        this.$ui.showToast({msg: 'Sign error',color:'#ff0000'})
      }).finally(() => {
        this.waitingSign = false
      })
    },
    selectFile(){
      window.addEventListener('focus', () => {
      }, { once: true });
      
      this.$refs.uploader.click();
    },
    onFileChanged(e) {
      const files = e.target.files
      const selectedFile = files[0]
    },
    insertSignature(){
      if(this.toggleSignType == 'type'){
        this.signFields[this.pendingSignFieldIdx].signed = true
        this.signFields[this.pendingSignFieldIdx].signature = this.signatureTypeContent
        this.signDialog = false
      }
    },
    showSignDialog(n){
      const field = this.signFields[n]
      if(field.account.toLowerCase() != this.$store.state.account.toLowerCase()){
        return
      }
      if(this.isSigned){
        return
      }
      this.pendingSignFieldIdx = n
      this.pendingSignField = field
      this.signDialog = true
    },
    loadDocs(){
      this.$chain.sign().getTokens([this.$route.query.id]).then(metas => {
        const meta = metas[0]
        this.contractName = meta.name

        this.signFields = meta.fields.map(f => {
          return {
            ...f,
            x: f.x.toNumber(),
            y: f.y.toNumber()
          }
        })
        this.signers = meta.signers
        this.viewers = meta.viewers
        this.signedList = meta.signed
        const idx = this.signedList.findIndex((item,index) => {
          return item.toLowerCase() == this.$store.state.account.toLowerCase()
        })
        this.isSigned = idx>=0
        this.$chain.store().metas(meta.storeId).then(storeMeta => {
          this.storeType = storeMeta.storeType
          this.storeUri = storeMeta.uri
          this.storeBucket = storeMeta.bucket
          this.storeObject = storeMeta.object

          let url = ''
          if(this.storeType == 0){
            url = `https://ipfs.io/ipfs/${this.storeUri}`
          }
          if(url){
            var loadingTask = pdf.createLoadingTask(url);
            this.src = loadingTask
            this.src.promise.then(pdf => {
              this.numPages = pdf.numPages;
            });
          }
          
        })
        
      })
      
    },
  }
}
</script>