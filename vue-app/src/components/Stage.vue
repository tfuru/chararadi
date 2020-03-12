<template>
  <div id="stage"></div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#stage {
  padding: 0;
  margin: 0;
  background-color: transparent;
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VRM, VRMSchema } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { FacialExpressionInterface } from '../store/modules/FacialExpression';

@Component
export default class Stage extends Vue {
  @Prop() private size: any;
  private scene = new THREE.Scene();
  private renderer = new THREE.WebGLRenderer({ alpha: true });
  private camera: THREE.PerspectiveCamera | null = null;
  private light = new THREE.DirectionalLight(0xffffff);
  private loader = new GLTFLoader();
  private vrm1: VRM | null = null;
  private vrm2: VRM | null = null;
  private mixer1: THREE.AnimationMixer | null = null;
  private mixer2: THREE.AnimationMixer | null = null;
  private clock = new THREE.Clock();

  private created() {
    console.log('created', this);
    console.log('store',this.$store);
    console.log('facialExpression', this.$store.getters.facialExpression);
  }

  private mounted() {
    // console.log('mounted');
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setClearColor( 0x000000, 0 );
    this.camera = new THREE.PerspectiveCamera(20, this.size.width / this.size.height, 0.1, 1000);
    this.camera.position.set(0,1.2,3);
    this.light.position.set(1,1,1).normalize();
    this.scene.add(this.light);
    
    const posX = 0.0;
    const promise1 = new Promise((resolve, reject) => {
      this.loaderLoad('/models/cecil-pink.vrm', posX*-1, 0, 0)
        .then((result: any) => {
          console.log('vrm1', result);
          this.vrm1 = result.vrm;
          this.mixer1 = result.mixer;
          // this.prepareAnimation(this.vrm1!, this.mixer1!);
          resolve(true);
        });
    });
    /*
    const promise2 = new Promise((resolve, reject) => {
      this.loaderLoad('/models/cecil-blue.vrm', posX, 0, 0)
        .then((result: any) => {
          console.log('vrm２', result);
          this.vrm2 = result.vrm;
          this.mixer2 = result.mixer;
          // this.prepareAnimation(this.vrm2!, this.mixer2!);
          resolve(true);
        });
    });
    Promise.all([promise1, promise2]).then((values: any) => {
    */
    Promise.all([promise1]).then((values: any) => {
      console.log('values', values);
      console.log('vrm1', this.vrm1, this.mixer1);
      // console.log('vrm2', this.vrm2, this.mixer2);
    });

    const stage: any = document.getElementById('stage');
    if (stage !== null) {
      stage.style.width = this.size.width;
      stage.style.height = this.size.height;
      stage.appendChild(this.renderer.domElement);
    }
  }

  private loaderLoad(src: string, x: number, y: number, z: number){
    return new Promise((resolve, reject) => {
      this.loader.load(
        src,
        ( gltf ) => {
          VRM.from( gltf ).then( ( v ) => {
            const vrm = v;
            // ポーズデータを読み込む
            fetch( '/poses/pose.json' )
              .then( ( res ) => res.json() )
              .then( ( json ) => {
                // ポーズ設定
                vrm.humanoid!.setPose( json );

                this.scene.add( vrm.scene );
                vrm.scene.position.set(x, y, z);
                
                // VRMアニメーション設定
                const mixer = new THREE.AnimationMixer( vrm.scene );
                resolve({vrm: vrm, mixer: mixer});
              } );
          } );
        },
        ( progress ) => {
          console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' );
        },
        ( error ) => {
          console.error( error );
        }
      );
    });
  }

  private prepareAnimation(vrm: VRM, mixer: THREE.AnimationMixer) {
    // ウインクさせてみる
    const trackName = vrm.blendShapeProxy!.getBlendShapeTrackName( VRMSchema.BlendShapePresetName.Blink );
    // console.log("trackName", trackName);
    const blinkTrack = new THREE.NumberKeyframeTrack(
        trackName!, // name
        [ 0.0, 0.5, 1.0 ], // times
        [ 0.0, 1.0, 0.0 ] // values
      );
    const clip = new THREE.AnimationClip( 'blink', 1.0, [ blinkTrack ] );
    const action = mixer.clipAction( clip );
    action.play();    
  }

  // アニメーション
  public drawLoop() {
    // requestAnimationFrame(this.drawLoop);
    if (this.clock == null) return;  
    const deltaTime = this.clock.getDelta();
    if (this.vrm1 !== null && this.mixer1 !== null){
      // this.vrm1.scene.rotation.y = Math.PI * Math.sin( this.clock.getElapsedTime() );
      this.vrm1.update( deltaTime );
      this.mixer1.update( deltaTime );

      const values: FacialExpressionInterface = this.$store.getters.facialExpression;
      if (this.vrm1.blendShapeProxy){
        const blink_l =  (0.9 < values.eyelid.blink_l)? 0.0 : values.eyelid.blink_l;
        const blink_r =  (0.9 < values.eyelid.blink_r)? 0.0 : values.eyelid.blink_r;
        // 表情の反映        
        this.vrm1.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.A, values.mouth.a );
        this.vrm1.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.BlinkL, blink_l );
        this.vrm1.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.BlinkR, blink_r );
      }
    }
    /*
    if (this.vrm2 !== null && this.mixer2 !== null){
      this.vrm2.update( deltaTime );
      this.mixer2.update( deltaTime );
      
      const values: FacialExpressionInterface = this.$store.getters.facialExpression;
      if (this.vrm2.blendShapeProxy){
        const blink_l =  (0.9 < values.eyelid.blink_l)? 0.0 : values.eyelid.blink_l;
        const blink_r =  (0.9 < values.eyelid.blink_r)? 0.0 : values.eyelid.blink_r;
        // 表情の反映
        this.vrm2.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.A, values.mouth.a );
        this.vrm2.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.BlinkL, blink_l );
        this.vrm2.blendShapeProxy.setValue( VRMSchema.BlendShapePresetName.BlinkR, blink_r );
      }
    }
    */
    this.renderer.render(this.scene, this.camera!);
  }
}
</script>

