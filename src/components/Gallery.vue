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
    // 生成的磚塊清單
    let bricks = reactive([]);
    // 圖片清單
    let imageUrls = reactive([
        "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
        "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
        "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
        "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
        "https://img.daisyui.com/images/stock/453966.webp",
    ]);
    // 生成的 sin wave 資料
    let sinTime = ref(0);

    // 初始化 component
    function init(){
        console.log("gallery.init");
        // 建立區塊
        genBricks();
    }
    // 取得 image 長寬比
    function getImageRatio(imageUrl){
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function() {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                function gcd(a, b) {
                    return b === 0 ? a : gcd(b, a % b);
                }

                const commonDivisor = gcd(naturalWidth, naturalHeight);
                const simplifiedWidth = naturalWidth / commonDivisor;
                const simplifiedHeight = naturalHeight / commonDivisor;

                resolve({width: simplifiedWidth, height: simplifiedHeight});
            }
            img.src = imageUrl;
        });
    }
    // 建立區塊
    async function genBricks(imageUrl){
        // 清空 bricks
        bricks.splice(0, bricks.length);

        let brickCount = getRandomNumber(7, 20);

        let imageBrickIndexs = [];
        imageUrls.forEach((iu, iu_i) => {
            while(imageBrickIndexs.length < imageUrls.length){
            let randomIndex = getRandomNumber(0, brickCount);

            if(imageBrickIndexs.indexOf(randomIndex) < 0){
                imageBrickIndexs.push(randomIndex);
            }
            }
        });

        let imgSrc = null;
        let imgRatio = null;
        let className = "";
        let bgColor = "";
        for(let mb_i = 0; mb_i < brickCount; mb_i++){
            imgSrc = null;
            imgRatio = null;
            className = "";
            bgColor = "#"
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16);

            if(imageBrickIndexs.indexOf(mb_i) >= 0){
                imgSrc = imageUrls[ imageBrickIndexs.indexOf(mb_i) ];
                imgRatio = await getImageRatio(imgSrc);
            }

            if(imgSrc){
                if(imgRatio["height"] > imgRatio["width"]){
                    // 直式圖
                    className = "h-70 w-55 rounded-box object-fill cursor-pointer";
                }else{
                    // 橫式圖
                    className = "h-20 w-96 rounded-box object-fill cursor-pointer";
                }
                bgColor = "transparent";
            }else{
                let sizeValue = getRandomNumber(3, 10);
                className = "h-" + sizeValue + " w-" + sizeValue + " rounded-box";
            }

            bricks.push({
                text: "",
                style: "background-color: " + bgColor + ";",
                imgSrc: imgSrc,
                className: className,
            });
        }
    }
    // showModal
    function showModal(imgUrl){
        selImgUrl.value = imgUrl;
        document.getElementById("imgModal").showModal();
    }

</script>

<template>

<div class="w-10/10 h-10/10 overflow-y-auto flex flex-wrap justify-center">
    <div v-for="(brickObj, brick_i) in bricks" class="m-1 rounded-box place-content-center" :style="brickObj.style">
        <img v-if="brickObj.imgSrc !== null" :src="brickObj.imgSrc" :class="brickObj.className" @click="showModal(brickObj.imgSrc)" />
        <div v-if="brickObj.imgSrc === null" :class="brickObj.className">{{ brickObj.text }}</div>
    </div>
</div>

<dialog id="imgModal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <div class="w-10/10 h-10/10">
      <img :src="selImgUrl" class="object-none" />
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
