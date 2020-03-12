<template>
  <div class="camera-expression">
    <button id="btn-camera-on" v-on:click='clickCameraOn'>カメラ</button>
    <div id="camera-container">
      <video id="camera-video" playsinline autoplay></video>
      <canvas id="camera-overlay" ></canvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
#btn-camera-on {
  z-index: 100;
}

#camera-container {  
  position: relative;

  #camera-video, #camera-overlay {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    transform: scaleX(-1);
  }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Camera extends Vue {
  @Prop() private size: any;
  @Prop() private onStart: any;
  @Prop() private display: any;

  private video!: HTMLVideoElement;
  private overlay!: HTMLCanvasElement;
  private stream: MediaStream | null = null;

  private created() {
    console.log('created', this.size);
  }

  private mounted() {
    const containerEle = document.getElementById('camera-container');
    if (!(containerEle instanceof HTMLElement)) {
      console.error('containerEle not an HTMLElement', containerEle)
      return
    }

    const videoEle = document.getElementById('camera-video');
    if (!(videoEle instanceof HTMLVideoElement)) {
      console.error('cameraEle not an HTMLVideoElement')
      return
    }
    this.video = videoEle;
    if (this.display == false){
      this.video.style.display = 'none';
    }

    const overlayEle = document.getElementById('camera-overlay');
    if (!(overlayEle instanceof HTMLCanvasElement)) {
      console.error('overlayEle not an HTMLCanvasElement')
      return
    }
    this.overlay = overlayEle;

    containerEle.style.width = `${this.size.width}px`;
    containerEle.style.height = `${this.size.height}px`;

    this.video.width = this.size.width;
    this.video.height = this.size.height;

    this.overlay.width = this.size.width;
    this.overlay.height = this.size.height;
  }

  // カメラを有効にする
  private clickCameraOn() {
    console.log('clickCameraOn',this.video.srcObject);
    if (this.stream) {
      console.log('stop');
      this.stream.getVideoTracks()[0].stop();
      this.stream = null;
    }else{
      navigator.mediaDevices.getUserMedia(
          { audio: false,
            /* video: true, */
            video: { width: this.size.width, height: this.size.height },
          })
          .then((stream) => {
          // console.log('stream',stream);
          if (this.video !== null) {
            this.stream = stream;
            this.video.srcObject = stream;

            if (this.onStart) {
              this.onStart( this.video );
            }
          }
        });
    }
  }

  public drawLoop(callback:(v:HTMLVideoElement) => void) {
    if (this.stream === null) {
      return;
    }
    callback( this.video );
  }
}
</script>
