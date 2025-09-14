<script setup>
    import { ref, reactive, onMounted } from 'vue'

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
    let channel_1 = reactive([]);
    let channel_2 = reactive([]);
    let channel_3 = reactive([]);
    let channel_4 = reactive([]);
    // 圖片清單
    let imageUrls = [
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

    // 初始化 component
    function init(){
        console.log("gallery.init");
        // 建立 channel
        genChannels();
    }
    // 建立 channel
    function genChannels(){
        // 清空 channels
        channel_1.splice(0, channel_1.length);
        channel_2.splice(0, channel_2.length);
        channel_3.splice(0, channel_3.length);
        channel_4.splice(0, channel_4.length);

        let imgCount = imageUrls.length / 4;
        console.log("imgCount=", imgCount);

        let channelIndex = 0;
        let imgGrpIndex = 0;
        imageUrls.forEach((imgSrc, is_i) => {
            imgGrpIndex = imgGrpIndex % imgCount;
            channelIndex += imgGrpIndex === 0 ? 1 : 0;
            channelIndex = channelIndex % 4;

            switch(channelIndex){
                case 0:
                channel_1.push( imgSrc );
                break;
                case 1:
                channel_2.push( imgSrc );
                break;
                case 2:
                channel_3.push( imgSrc );
                break;
                case 3:
                channel_4.push( imgSrc );
                break;
            }
        });
    }
    // showModal
    function showModal(imgUrl){
        selImgUrl.value = imgUrl;
        document.getElementById("imgModal").showModal();
    }

</script>

<template>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="grid gap-4">
        <div v-for="(imgSrc, is_i) in channel_1">
            <img class="h-auto max-w-full rounded-lg" :src="imgSrc" alt="" @click="showModal(imgSrc)">
        </div>
    </div>
    <div class="grid gap-4">
        <div v-for="(imgSrc, is_i) in channel_2">
            <img class="h-auto max-w-full rounded-lg" :src="imgSrc" alt="" @click="showModal(imgSrc)">
        </div>
    </div>
    <div class="grid gap-4">
        <div v-for="(imgSrc, is_i) in channel_3">
            <img class="h-auto max-w-full rounded-lg" :src="imgSrc" alt="" @click="showModal(imgSrc)">
        </div>
    </div>
    <div class="grid gap-4">
        <div v-for="(imgSrc, is_i) in channel_4">
            <img class="h-auto max-w-full rounded-lg" :src="imgSrc" alt="" @click="showModal(imgSrc)">
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
