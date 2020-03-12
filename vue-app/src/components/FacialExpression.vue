<template>
  <div class="facial-expression">
    <div id="facial-container">
      <canvas id="facial-overlay" ></canvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
#facial-container {  
  position: relative;

  #facial-overlay {
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
declare var clm: any;

import { FacialExpressionInterface } from '../store/modules/FacialExpression';

@Component
export default class FacialExpression  extends Vue {
  @Prop() private size: any;
  @Prop() private display: any;

  private clmtrackr: any;
  private video!: HTMLVideoElement;
  private overlay!: HTMLCanvasElement;
  private overlayCC!: CanvasRenderingContext2D;

  private facialExpression:FacialExpressionInterface = this.$store.getters.facialExpression;
  
  private created() {
    console.log('created', this.size);
  }

  private mounted() {
    const containerEle = document.getElementById('facial-container');
    if (!(containerEle instanceof HTMLElement)) {
      console.error('containerEle not an HTMLElement', containerEle)
      return
    }
    if (this.display == false){
      containerEle.style.display = 'none'; 
    }

    const overlayEle = document.getElementById('facial-overlay');
    if (!(overlayEle instanceof HTMLCanvasElement)) {
      console.error('overlayEle not an HTMLCanvasElement')
      return
    }
    this.overlay = overlayEle;
    this.overlayCC = this.overlay.getContext('2d')!;

    containerEle.style.width = `${this.size.width}px`;
    containerEle.style.height = `${this.size.height}px`;

    this.overlay.width = this.size.width;
    this.overlay.height = this.size.height;
    
    console.log('clm', clm);
    this.clmtrackr = new clm.tracker();
    this.clmtrackr.init();
  }

  // 目,口の開閉 0.0 - 1.0
  private landmarkOpenLv(p:[], i1: number, i2: number, base: number): number {
    const p1 = p[i1][1];
    const p2 = p[i2][1];
    // console.log('p1', p1);
    // console.log('p2', p2);
    // console.log('v', Math.abs(p1 - p2));
    const v = ( Math.abs(p1 - p2) / base);
    return (v > 1.0) ? 1.0 : v;
  }

  public onCameraStart(v: HTMLVideoElement) {
    this.video = v;
    this.clmtrackr.start( v );
  }

  public drawLoop() {
    if (this.video === null) {
      return;
    }

    // 顔データ取得 顔パーツ,表情
    const position = this.clmtrackr.getCurrentPosition();
    // console.log('position', position);
    if (!position) {
      return;
    }

    // ここで 口開閉, 瞬きを判定する
    this.facialExpression.eyelid.blink_l  = this.landmarkOpenLv(position, 24, 26, 12.0); // 24,27,26
    this.facialExpression.eyelid.blink_r = this.landmarkOpenLv(position, 29, 31, 12.0);// 29,32,31
    this.facialExpression.mouth.a = this.landmarkOpenLv(position, 60, 57, 37.0);  // 60 - 57
    this.$store.dispatch('doUpdateFacialExpression', this.facialExpression); 
    
    // 描画設定が有効な場合
    if (this.display == true){
      this.overlayCC.clearRect(0, 0, this.overlay.width, this.overlay.height);
      this.clmtrackr.draw(this.overlay);
    }
  }
}
</script>
