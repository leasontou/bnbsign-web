<template>
  <div class="d-flex flex-row justify-center pa-2" style="position: relative;">
    <div style="flex:1;max-width: 900px;" class="py-2">
      <div v-for="i in numPages" :key="i" class="doc-page mb-2" style="position: relative;"
        :ref="'page'+i"
        @click="addSignField($event,i)">
        <pdf
          :src="src"
          :page="i"
          style="display: inline-block; width: 100%">
        </pdf>
        <template v-for="(f,n) in signFields">
          <VueDragResize
            v-if="f.page==i"
            :isDraggable="true"
            w="auto" 
            h="auto" 
            :x="f.x"
            :y="f.y"
            :parentLimitation="true"
            :isActive="activated==n"
            @dragstop="onDragstop($event,n)"
            @clicked="onActivated($event,n)"
            @activated="onActivated($event,n)"
            @deactivated="onDeactivated($event,n)"
            style="cursor: move;"
            class="rounded sign-container pa-3 text-center">
            <div v-if="f.field=='signature'">
              <inline-svg :src="require('../assets/img/common/signature.svg')" width="24" height="24"></inline-svg>
              <div>{{ f.address | hash }} Signature</div>
            </div>
            <div v-else-if="f.field=='wallet'">
              <v-icon color="#2B6EF1">mdi-wallet</v-icon>
              <div>{{ f.address | hash }}</div>
            </div>
          </VueDragResize>
        </template>
      </div>
    </div>
    
    <div v-if="prepareAddSignature && mousePosition" class="sign-container pa-3 rounded text-center" style="position: fixed;z-index:10;" :style="mousePosition">
      <v-icon color="#2B6EF1">mdi-wallet</v-icon>
      <div>{{ '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' | hash }}</div>
    </div>

    
    <v-navigation-drawer permanent right app width="300">
      <div class="d-flex flex-column" style="height: 100%;">
        <v-sheet class="pa-4">
          <span class="text-h6">Place Fields</span>
        </v-sheet>
        <v-list style="flex: 1;">
          <v-list-group v-for="(f,n) in placeFields" :key="n">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{f.title}}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item v-for="(signer,n) in recipients" v-if="signer.type=='signer'" :key="n" class="pointer" 
              @click="prepareAdd(f.value,signer.address)">
              <v-list-item-icon class="mr-2">
                <inline-svg :src="f.icon" width="24" height="24"></inline-svg>
              </v-list-item-icon>
              <v-list-item-title class="black--text font-weight-bold">
                <div>{{signer.address | hash}}'s</div>
                <div>{{f.name}}</div>
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list>
        <div class="d-flex flex-row pa-4">
          <v-spacer></v-spacer>
          <v-btn dark @click="back" depressed class="text-none border-btn px-6 primary-text">Back</v-btn>
          <v-btn dark @click="next" :disabled="!signFields || signFields.length==0" depressed class="text-none ml-4 px-6 gradient-bg">Next</v-btn>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import pdf from 'vue-pdf'

export default {
  props:[
    "file","fields","recipients"
  ],
  data:()=>({
    src: null,
    numPages: 0,
    prepareAddSignature: false,
    mousePosition: '',
    placeFields:[
      {
        title: 'Signature Fields',
        value: 'signature',
        name: 'Signature',
        icon: require('../assets/img/common/signature.svg')
      },
      // {
      //   title: 'Wallet Address',
      //   value: 'wallet',
      //   name: 'Wallet Address',
      //   icon: require('../assets/img/common/signature.svg')
      // }
    ],
    signFields: [],
    signField: {},
    activated: -1,
  }),
  watch:{
    file(newFile,oldFile){
      this.loadDocs()
    },
    fields(newVal){
      this.signFields = this.fields?this.fields:[]
    }
  },
  mounted(){
    this.signFields = this.fields?this.fields:[]
    this.loadDocs()
    document.onkeydown = (e) => {
      this.onkeydown()
    }
  },
  beforeDestroy(){

  },
  methods:{
    onkeydown(){
      let key = window.event.keyCode;
      if (key === 27) { 
        // ESC
        window.event.preventDefault();
        this.prepareAddSignature = false
        this.mousePosition = ''
      }else if(key == 8 || key ==46){
        // backspace or delete
        if(this.activated >= 0){
          const newFields = this.signFields.filter((item,i) => {
            return this.activated != i
          });
          this.signFields = newFields
          // this.signFields.splice(this.activated, 1)
          this.activated = -1

          this.emitFieldsChange()
        }
      }
    },
    onMousemove(e){
      if(this.prepareAddSignature){
        this.mousePosition = `left:${e.clientX}px;top:${e.clientY}px;`
      }
    },
    onPrepareSign(){
    },
    loadDocs(){
      if (this.file) {
        var loadingTask = pdf.createLoadingTask(this.createURI(this.file));
        this.src = loadingTask
        this.src.promise.then(pdf => {
          this.numPages = pdf.numPages;
        });
      }else{
        this.src = null
        this.numPages = 0
      }
    },
    createURI(f){
      var uri = window.URL.createObjectURL(f)
      return uri
    },
    back(){
      this.$emit('onBack')
    },
    next(){
      this.$emit('onNext')
    },
    prepareAdd(signField,signer){
      this.prepareAddSignature = true
      this.signField = {
        type: signField,
        address: signer
      }
    },
    addSignField(e,page){
      if(this.prepareAddSignature){
        this.prepareAddSignature = false
        this.mousePosition = ''
        let ref = eval('this.$refs.page'+page)[0]
        let wRatio = e.offsetX*1000000/ref.offsetWidth
        let hRatio = e.offsetY*1000000/ref.offsetHeight
        this.signFields.push({
          page: page,
          field: this.signField.type,
          address: this.signField.address,
          x: e.offsetX,
          y: e.offsetY,
          wRatio: wRatio,
          hRatio: hRatio
        })

        this.signField = {}

        this.emitFieldsChange()
      }
    },
    onDragstop(e,n){
      const page = this.signFields[n].page
      let ref = eval('this.$refs.page'+page)[0]
      let wRatio = e.left*1000000/ref.offsetWidth
      let hRatio = e.top*1000000/ref.offsetHeight

      this.signFields[n].x = e.left
      this.signFields[n].y = e.top
      this.signFields[n].wRatio = wRatio
      this.signFields[n].hRatio = hRatio

      console.log(this.signFields[n])

      this.emitFieldsChange()
    },
    onActivated(e,n){
      this.activated = n
    },
    onDeactivated(e,n){
      if(this.activated == n){
        this.activated = -1
      }
    },
    emitFieldsChange(){
      this.$emit('onSignFieldsChanged', this.signFields)
    }
  }
}
</script>

<style scoped>

</style>