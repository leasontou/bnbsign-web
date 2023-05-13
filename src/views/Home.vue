<template>
  <v-container>
    <v-card depressed elevation="0">
      <v-card-title>Upload Contract</v-card-title>
      <v-card-text>
        <div class="pa-4 rounded d-flex flex-column align-center justify-center" style="background: #F3F5FA;border: 1px dashed #000000;height: 200px;">
          <v-btn depressed color="primary" class="text-none" @click="selectFile">Browse Files</v-btn>
          <input 
            ref="uploader" 
            class="d-none" 
            type="file" 
            accept=".pdf"
            multiple
            @change="onFileChanged"
          >
        </div>
        
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
        <vue-pdf-embed v-if="selectedFiles.length>0" 
          :source="pdfURI">
        </vue-pdf-embed>
      </v-card-text>
      
    </v-card>
  </v-container>
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'

export default {
  name: 'Home',
  components: {
    VuePdfEmbed,
  },
  data:()=>({
    isSelecting: false,
    selectedFiles: [],
    loadingTask: null,
    numPages: null,
  }),
  mounted(){
  },
  methods:{
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
      this.pdfURI = this.createURI(this.selectedFiles[0])
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
