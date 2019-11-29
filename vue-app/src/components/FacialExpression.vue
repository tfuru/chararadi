<template>
  <div class="facial-expression">
    <button v-on:click='clickCameraOn'>カメラ</button>
    <div id="facial-container">
      <video id="facial-camera" playsinline autoplay></video>
      <canvas id="facial-overlay" ></canvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
#facial-container {  
  position: relative;

  #facial-camera, #facial-overlay {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    transform: scaleX(-1);

    display: none;
  }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as faceapi from 'face-api.js';

import { FacialExpressionInterface } from '../store/modules/FacialExpression';

@Component
export default class FacialExpression  extends Vue {
  @Prop() private size: any;

  private camera!: HTMLVideoElement;
  private overlay!: HTMLCanvasElement;
  private stream: MediaStream | null = null;

  // モデル
  private MODEL_URI = '/face/weights';

  private created() {
    console.log('created', this.size);
    // console.log('faceapi', faceapi.nets)
    console.log('store',this.$store);
    console.log('facialExpression', this.$store.getters.facialExpression);
  }

  private mounted() {
    const containerEle = document.getElementById('facial-container');
    if (!(containerEle instanceof HTMLElement)) {
      console.error('containerEle not an HTMLElement', containerEle)
      return
    }

    const cameraEle = document.getElementById('facial-camera');
    if (!(cameraEle instanceof HTMLVideoElement)) {
      console.error('cameraEle not an HTMLVideoElement')
      return
    }
    this.camera = cameraEle;

    const overlayEle = document.getElementById('facial-overlay');
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
    
    // モデルをロードする
    Promise.all([
      // 顔認識
      faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URI),
      // 顔パーツの位置
      faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URI),
      // 表情スコア
      faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URI),
    ])
    .then(() => {
      console.log('load MODEL_URI');
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
          { audio: false,
            video: true,
            /* video: { width: this.size.width, height: this.size.height }, */
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

  // 目,口の開閉 0.0 - 1.0
  private landmarkOpenLv(p:faceapi.Point[], i1: number, i2: number, base: number): number {
    const p1 = p[i1].y;
    const p2 = p[i2].y;
    // console.log('v', Math.abs(p1 - p2));
    const v = ( Math.abs(p1 - p2) / base);
    return (v > 1.0) ? 1.0 : v;
  }

  private async drawLoop() {
    requestAnimationFrame(this.drawLoop);
    if (this.overlay !== null && this.camera !== null) {
      // console.log('overlayCC');
      // オーバーレイ 表示

      // 1人 顔データ取得 顔パーツ,表情
      const detections = await faceapi.detectSingleFace(
                              this.camera,
                              new faceapi.TinyFaceDetectorOptions()
                          ).withFaceLandmarks()
                          .withFaceExpressions();
      if(typeof detections === 'undefined'){
        return;
      }

      // console.log('detections', detections);
      // const expressions = detections.expressions;
      // console.log('expressions', expressions);
      /*
      angry: 0.002782773692160845
      disgusted: 0.000007903956429800019
      fearful: 4.904609909317514e-7
      happy: 0.00007700323476456106
      neutral: 0.9826717376708984
      sad: 0.014413285069167614
      surprised: 0.00004698477277997881
      */

      const landmarks: faceapi.FaceLandmarks68 = detections.landmarks;
      // console.log('landmarks', landmarks);
      // Points 0 - 67
      // leftEye 37 - 42   38,41 ,5 
      // rightEye 43 - 48  44,48 ,5
      // mouth   49 - 67  63,67, 18

      const src:FacialExpressionInterface = this.$store.getters.facialExpression;
      src.eyelid.blink_l = this.landmarkOpenLv(landmarks.getLeftEye(), 1, 4, 10.0);
      src.eyelid.blink_r = this.landmarkOpenLv(landmarks.getRightEye(), 2, 5, 10.0);
      src.mouth.a = this.landmarkOpenLv(landmarks.getMouth(), 15, 19, 25.0);
      // console.log('leftEye', src.eyelid.blink_l);
      // console.log('rightEye', src.eyelid.blink_r);
      // console.log('mouth', src.mouth.a);
      this.$store.dispatch('doUpdateFacialExpression', src);

      /*
      const jawOutline = landmarks.getJawOutline()
      const nose = landmarks.getNose()
      const mouth = landmarks.getMouth(); // 15,19
      const leftEye = landmarks.getLeftEye() // 2,4
      const rightEye = landmarks.getRightEye() // 1,5
      const leftEyeBbrow = landmarks.getLeftEyeBrow()
      const rightEyeBrow = landmarks.getRightEyeBrow()
      */

      // console.log('camera', this.camera.width, this.camera.height);
      // console.log('overlay', this.overlay);
      // リサイズ
      const resizedDetections = faceapi.resizeResults(detections, {
                        width: this.size.width,
                        height: this.size.height });
      
      this.overlay.getContext('2d')!.clearRect(0, 0, this.size.width, this.size.height);
      // 顔の位置
      faceapi.draw.drawDetections(this.overlay, resizedDetections);
      // 顔のパーツ
      faceapi.draw.drawFaceLandmarks(this.overlay, resizedDetections);
      // 表情    
      faceapi.draw.drawFaceExpressions(this.overlay, resizedDetections); 
    }
  }
}
</script>
