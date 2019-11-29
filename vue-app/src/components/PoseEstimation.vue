<template>
  <div class="pose-estimation">
    <button v-on:click='clickCameraOn'>カメラ</button>
    <div id="pose-container">
      <video id="pose-camera" playsinline autoplay></video>
      <canvas id="pose-overlay" ></canvas>
    </div>
    <img id="pose-dummy" src='/img/pose-dummy/1.png'>
  </div>
</template>

<style scoped lang="scss">
#facial-container {  
  position: relative;

}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as Posenet from '@tensorflow-models/posenet'

@Component
export default class PoseEstimation extends Vue {
  @Prop() private size: any;

  private camera!: HTMLVideoElement;
  private overlay!: HTMLCanvasElement;
  private stream: MediaStream | null = null;
  private posenet!: Posenet.PoseNet;

  private created() {
    console.log('created', this.size);
  }

  private async mounted() {    
    const containerEle = document.getElementById('pose-container');
    if (!(containerEle instanceof HTMLElement)) {
      console.error('containerEle not an HTMLElement', containerEle)
      return
    }

    const cameraEle = document.getElementById('pose-camera');
    if (!(cameraEle instanceof HTMLVideoElement)) {
      console.error('cameraEle not an HTMLVideoElement')
      return
    }
    this.camera = cameraEle;

    const overlayEle = document.getElementById('pose-overlay');
    if (!(overlayEle instanceof HTMLCanvasElement)) {
      console.error('overlayEle not an HTMLCanvasElement')
      return
    }
    this.overlay = overlayEle;

    containerEle.style.width = `${this.size.width}px`;
    containerEle.style.height = `${this.size.height}px`;

    this.camera.width = this.size.width;
    this.camera.height = this.size.height;

    this.overlay.width = this.size.width;
    this.overlay.height = this.size.height;

    console.log('Posenet', Posenet);
    Posenet.load().then((net) => {
      console.log('net', net);
      this.posenet = net;

      const dummyEle = document.getElementById('pose-dummy');
      if (!(dummyEle instanceof HTMLImageElement)) {
        return;
      }

      this.posenet.estimateSinglePose(dummyEle, {flipHorizontal: false})
        .then((pose) => {
          console.log('pose', pose);
        });
    });
  }

  // カメラを有効にする
  private clickCameraOn() {
    console.log('clickCameraOn',this.camera.srcObject);
    if (this.stream) {
      console.log('stop');
      this.stream.getVideoTracks()[0].stop();
    }else{
      navigator.mediaDevices.getUserMedia(
          { 
            audio: false,
            video: true,
          })
          .then((stream) => {
          // console.log('stream',stream);
          if (this.camera !== null) {
            this.stream = stream;
            this.camera.srcObject = stream;

            this.drawLoop();
          }
        });
    }
  }

  private async drawLoop() {
    requestAnimationFrame(this.drawLoop);
  }
}
</script>