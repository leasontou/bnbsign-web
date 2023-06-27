<template>
  <v-dialog 
    v-model="dialog" 
    max-width="300" 
    overlay-opacity="0.8"
    :persistent="persistent"
    @input="inputChange"
    content-class="dialog-bg rounded-lg ba">
    <v-responsive :aspect-ratio="4/4">
      <v-card flat 
        color="transparent"
        class="rounded-lg pa-1 d-flex flex-column justify-center align-center" 
        style="height:100%;">
        <v-progress-circular
          :size="80"
          :width="2"
          class="my-4"
          indeterminate
          color="#895ff1"
        ></v-progress-circular>
        <!-- <Socket size="80px" color="#F3642E" secondaryColor="#F8955D" class="my-4"></Socket> -->
        <div class="text-h6 px-2 text-center" v-if="title">{{title}}</div>
        <div class="text-caption px-2 text-center" v-if="msg">{{msg}}</div>
      </v-card>
    </v-responsive>
  </v-dialog>
</template>

<script>

export default {
  components:{
    
  },
  props: {
    value:{default: false},
    title:{default: ''},
    msg:{default: ''},
    persistent:{default:false}
  },
  data(){
    return {
      dialog: false,
    }
  },
  watch:{
    value(newVal){
      this.dialog = newVal;
    }
  },
  methods:{
    inputChange(opened){
      this.$emit('input',opened);
    }
  }
}
</script>