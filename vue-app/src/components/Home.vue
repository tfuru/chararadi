<template>
  <div id="home">
    <Stage ref='stage' id="stage" :size='stageSize' />
    <FacialExpression ref='facial' id="facial" :display='false' :size='{width: 640, height: 480}'/> 
    <Camera ref='camera' id="camera" :on-start='onCameraStart' :display='false' :size='{width: 640, height: 480}'/> 
    <!--
    <PoseEstimation id="pose" :size='{width: 640, height: 480}'/>
    -->
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#home {
  position: relative;
  height: 100%;
  #stage, #facial, #camera { 
    position: absolute;
    top: 20px;
    left: 0;
  }

  #camera {
    position: absolute;
    top: 0;
    left: 0;    
    /* background-color: red; */
  }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Camera from './Camera.vue';
import Stage from './Stage.vue';
import FacialExpression from './FacialExpression.vue';
import PoseEstimation from './PoseEstimation.vue';

@Component({
  components: {
    Camera,
    Stage,
    FacialExpression,
    PoseEstimation,
  },
})
export default class Home extends Vue {
  private stageSize = {width: window.innerWidth, height: window.innerHeight};

  private created() {
    console.log('created');
  }

  private mounted() {
    this.drawLoop(0);
  }

  // カメラキャプチャ 開始
  private onCameraStart(v: HTMLVideoElement) {
    if (this.$refs.facial instanceof FacialExpression) {
      this.$refs.facial.onCameraStart(v);
    }
  }

  // アニメーション ループ
  private drawLoop(timestamp: number) {  
    if (this.$refs.stage instanceof Stage) {
      this.$refs.stage.drawLoop();
    }
    if (this.$refs.facial instanceof FacialExpression) {
      this.$refs.facial.drawLoop();
    }
    requestAnimationFrame(this.drawLoop);
  }
}
</script>

