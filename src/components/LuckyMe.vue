<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import moment from 'moment'
    import { gsap } from "gsap";

    onMounted(() => {
        console.log("LuckyMe mounted.");
        init();

        // gsap animation
        setTimeout(() => {
            let boxColors = ["green", "blue", "purple", "gold", "peru", "blanchedalmond", "blueviolet", "goldenrod"];
            let boxContainer = document.getElementById("boxContainer");
            let boxCount = 50;
            for(let box_i = 1; box_i <= boxCount; box_i++){
                let box_div = document.createElement("div");
                box_div.setAttribute("id", "box_" + box_i);
                box_div.style.backgroundColor = boxColors[ box_i % boxColors.length ];
                box_div.style.width = "30px";
                box_div.style.height = "30px";

                boxContainer.append(box_div);
            }


            for(let box_i = 1; box_i <= boxCount; box_i++){
                let tl = gsap.timeline({ yoyo: true, repeat: -1, });
                tl.to("#box_" + box_i, {
                    duration: box_i,
                    opacity: 0,
                });
            }
        }, 100);
    });

    let canvas_card = null;
    let ctx_card = null;
    let isDrawing = false;
    let isReceive = ref(false);

    // 初始化 component
    function init(){
        console.log("LuckyMe.init");

        // 利用 canvas 製作刮刮卡背景圖
        let base64Image_award = buildAwardCanvas();
        // 製作刮刮卡
        buildScratchCardCanvas(base64Image_award);
    }
    // 建立刮刮卡背景圖
    function buildAwardCanvas(){
        let canvas_award = document.getElementById("awardCanvas");
        let container_award = document.getElementById('awardContainer');
        canvas_award.setAttribute("width", container_award.clientWidth);
        canvas_award.setAttribute("height", container_award.clientHeight);

        let ctx_award = canvas_award.getContext('2d');        
        ctx_award.font = "50px Arial"; // Sets font to 30px Arial
        ctx_award.textAlign = "center";
        ctx_award.textBaseline = "middle";
        ctx_award.fillText("Biggest Award", canvas_award.width / 2, canvas_award.height / 2);

        let base64Image_award = canvas_award.toDataURL('image/png', 1.0); // Get PNG with full quality
        return base64Image_award;
    }
    // 建立刮刮卡
    function buildScratchCardCanvas(base64Image_award){
        canvas_card = document.getElementById('scratchCardCanvas');
        let cardContainer = document.getElementById('scratchCardContainer');
        canvas_card.setAttribute("width", cardContainer.clientWidth);
        canvas_card.setAttribute("height", cardContainer.clientHeight);
        canvas_card.style.background = "url('" + base64Image_award + "')";
        ctx_card = canvas_card.getContext('2d');   

        // 設定刮刮卡的塗層顏色或圖片
        ctx_card.fillStyle = '#888'; // 塗層顏色，也可以用圖片
        ctx_card.fillRect(0, 0, canvas_card.width, canvas_card.height);

        // 添加事件監聽器
        canvas_card.addEventListener('mousedown', startDrawing);
        canvas_card.addEventListener('mouseup', stopDrawing);
        canvas_card.addEventListener('mousemove', scratch);

        // 支援觸控事件
        canvas_card.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止滾動
            startDrawing(e.touches[0]);
        });
        canvas_card.addEventListener('touchend', stopDrawing);
        canvas_card.addEventListener('touchmove', (e) => {
            e.preventDefault(); // 防止滾動
            scratch(e.touches[0]);
        });

        // 製作完成 刮刮卡, 可以隱藏了
        document.getElementById("awardContainer").style.display = "none";
    }
    // 取得 mouse 位置
    function getMousePos(canvas_card, evt) {
        const rect = canvas_card.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    // 觸控 touchstart
    function startDrawing(e) {
        isDrawing = true;
        scratch(e);
    }
    // 觸控 touchend
    function stopDrawing() {
        isDrawing = false;
        ctx_card.beginPath(); // 重置路徑
    }
    // 刮刮刮...的動作
    function scratch(e) {
        if (!isDrawing) return;

        const pos = getMousePos(canvas_card, e);

        // 設定繪圖樣式，這裡使用 destination-out 模式來「擦除」塗層
        ctx_card.globalCompositeOperation = 'destination-out';
        ctx_card.beginPath();
        ctx_card.arc(pos.x, pos.y, 10, 0, Math.PI * 2); // 繪製圓形作為刮開的區域
        ctx_card.fill();
    }
    // 領取獎勵
    function receiveAward(){
        isReceive.value = true;

        // 將[刮刮卡]層全部變成透明
        ctx_card.globalCompositeOperation = 'destination-in';
        ctx_card.fillStyle = 'transparent'; // 塗層顏色，也可以用圖片
        ctx_card.fillRect(0, 0, canvas_card.width, canvas_card.height);
    }

</script>

<template>

    <div class="w-10/10 h-10/10 flex flex-col justify-center">
        <div class="w-10/10 h-1/10 flex flex-col justify-center">
            <div class="w-10/10 text-3xl">Lucky Me!</div>
            <div v-if="isReceive" class="w-10/10 text-2xl">You are so lucky~~</div> 
        </div>

        <!-- 刮刮卡 container -->
        <div id="scratchCardContainer" class="w-10/10 h-5/10 mt-5">
            <!-- 刮刮卡 -->
            <canvas id="scratchCardCanvas" style="cursor: crosshair;"></canvas>
        </div>

        <!-- 用來產生刮刮卡背景圖的 canvas -->
        <div id="awardContainer" class="w-10/10 h-5/10">
            <canvas id="awardCanvas"></canvas>
        </div>

        <div class="w-10/10 h-1/10 flex flex-row justify-center">
            <button class="btn btn-primary w-5/10 mt-5" @click="receiveAward">
                領獎
            </button>
        </div>

        <div id="boxContainer" class="w-10/10 h-3/10 flex flex-row justify-center">
            <!--
            <div id="box1" style="background-color: green;height:30px;width:30px;"></div>
            <div id="box2" style="background-color: blue;height:30px;width:30px;"></div>
            <div id="box3" style="background-color: purple;height:30px;width:30px;"></div>
            <div id="box8" style="background-color: gold;height:30px;width:30px;"></div>
            <div id="box4" style="background-color: peru;height:30px;width:30px;"></div>
            <div id="box5" style="background-color: blanchedalmond;height:30px;width:30px;"></div>
            <div id="box6" style="background-color: blueviolet;height:30px;width:30px;"></div>
            <div id="box7" style="background-color: goldenrod;height:30px;width:30px;"></div>
            -->
        </div>


    </div>
</template>

<style scoped>

</style>
