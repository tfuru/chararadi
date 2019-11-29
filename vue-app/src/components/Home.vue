<template>
  <div id="home">
    <!--
    <div id='youtube'>
      <iframe 
        width="560"
        height="315"
        src="https://www.youtube.com/embed/9TquSD-yo3o?autoplay=1"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>

    <Stage id="stage" :size='stageSize' />
    <FacialExpression id="facial" :size='{width: 640, height: 480}'/>
    -->
    <PoseEstimation id="pose" :size='{width: 640, height: 480}'/>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#home {
  position: relative;
  height: 100%;
  #youtube, #stage, #facial { 
    position: absolute;
    top: 0;
    left: 0;
  }
  
  #youtube {
    top: 50%;
    left: 50%;
    transform: translateY(50%) translateX(-50%);
    -webkit-transform: translateY(50%) translateX(-50%);
    margin: auto;
  }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Stage from './Stage.vue';
import FacialExpression from './FacialExpression.vue';
import PoseEstimation from './PoseEstimation.vue';

@Component({
  components: {
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
}
</script>

