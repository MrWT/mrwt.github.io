<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { getRandomNumber } from "@/composables/random"

    defineProps({
        title: String,
        account: String,
    })

    onMounted(() => {
        console.log("gallery.mounted");
        init();

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));

        }, 1000);

    });

    let appState = ref("");
    // 選擇的圖片 url
    let selImgUrl = ref("");
    // 生成的 channels
    let channelCount = 1;
    let channels = reactive([]);
    // 圖片候選清單
    let imageCount = 100;
    let candidateImageUrls = [
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg",
        "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg",
    ];
    let imageUrls = [];

    // 初始化 component
    function init(){
        console.log("gallery.init");
        // 依據 imageCount 生成 imageUrls
        imageCount = getRandomNumber(candidateImageUrls.length, 100);
        for(let img_i = 0; img_i < imageCount; img_i++){
            let imgIndex = getRandomNumber(0, candidateImageUrls.length -1);
            let imgUrl = candidateImageUrls[ imgIndex ];
            imageUrls.push( imgUrl );
        }

        // w-sm 約等於 384px
        // w-md 約等於 448px
        //console.log("window.innerWidth=" + window.innerWidth);
        if(window.innerWidth > 448){
            channelCount = getRandomNumber(3, 4);
        }else if(304 < window.innerWidth && window.innerWidth < 448 ){
            channelCount = getRandomNumber(1, 2);
        }else{
            channelCount = getRandomNumber(1, 1);
        }
        // 依據 channelCount 生成 channel
        for(let c_i = 0; c_i < channelCount; c_i++){
            channels.push( [] );
        }
        // 建立 channel 內容
        genChannels();
    }
    // 建立 channel
    function genChannels(){
        // 清空 channels
        for(let c_i = 0; c_i < channelCount; c_i++){
            channels[c_i].splice(0, channels[c_i].length);
        }

        let imgCount = imageUrls.length / channelCount;
        console.log("imgCount=", imgCount);

        let channelIndex = 0;
        let imgGrpIndex = 0;
        imageUrls.forEach((imgSrc, is_i) => {
            imgGrpIndex = imgGrpIndex % imgCount;
            channelIndex += imgGrpIndex === 0 ? 1 : 0;
            channelIndex = channelIndex % channelCount;

            channels[channelIndex].push( imgSrc );
        });
    }
    // showModal
    function showModal(imgUrl){
        selImgUrl.value = imgUrl;
        document.getElementById("imgModal").showModal();
    }

</script>

<template>

<div class="grid gap-4"
:class="{ 'grid-cols-1': channels.length === 1,
          'grid-cols-2': channels.length === 2,
          'grid-cols-3': channels.length === 3,
          'grid-cols-4': channels.length === 4 }">
    <div v-for="(channel, c_i) in channels" class="grid"
      :class="{ 'gap-16': channels.length === 1,
                'gap-20': channels.length === 2,
                'gap-20': channels.length === 3,
                'gap-20': channels.length === 4 }">
        <div v-for="(imgSrc, is_i) in channel">
            <img class="h-auto max-w-full rounded-lg shadow-2xl" :src="imgSrc" alt="" @click="showModal(imgSrc)">
        </div>
    </div>
</div>

<dialog id="imgModal" class="modal">
  <div class="modal-box w-10/10 h-8/10">
    <h3 class="text-lg font-bold">Hello!</h3>
    <div class="w-10/10 h-8/10 justify-items-center content-center">
      <img :src="selImgUrl" class="max-h-full object-fill rounded-lg" />
    </div>

    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

</template>

<style scoped>

</style>
