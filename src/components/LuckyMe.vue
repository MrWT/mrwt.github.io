<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import moment from 'moment'
    import { gsap } from "gsap";
    import { ScrollTrigger } from "gsap/ScrollTrigger";

    onMounted(() => {
        console.log("Chat mounted.");
        init();

         // gsap animation
        gsap.registerPlugin(ScrollTrigger);

        let tl = gsap.timeline({ yoyo: false, repeat: -1, });
        tl.to(".circle", {
            rotation: 360,
            duration: 0.7,
            stagger: 0.5,
        });
    });

    // 初始化 component
    function init(){
        console.log("LuckyMe.init");
    }

</script>

<template>

    <div class="w-10/10 text-center">
        <h1>Lucky Me</h1>

        <div class="circle"></div>
    </div>

</template>

<style scoped>
  .circle {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: conic-gradient(red 0deg 90deg, blue 90deg 180deg, green 180deg 270deg, yellow 270deg 360deg);
    }
</style>
