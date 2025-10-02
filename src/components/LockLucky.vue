<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { gsap } from "gsap"
    import { fetchData } from "@/composables/fetchData"
    import { getRandomNumber } from "@/composables/random"

    onMounted(() => {
        console.log("LockLucky mounted.");
        init();
    });

    let awards = [];
    let selAwardObj = {};

    let canvas_card = null;
    let ctx_card = null;
    let isDrawing = false;
    let isReceive = ref(false);

    let uniqueIds = [];
    let gsapTimelines = [];

    // 初始化 component
    function init(){
        console.log("LockLucky.init");

        // 取得 award 資料
        fetchAward();
    }
    // 取得 award 資料
    function fetchAward(){
        let fetchAwardPromise = fetchData({
            api: "get_awards",
            data: {
                check_receive_count: "true",
            },
        });
        Promise.all([fetchAwardPromise]).then((values) => {
            //console.log("fetchAwardPromise.values=", values);
            awards = values[0];
            console.log("awards=", awards);
            // 選擇一個獎項
            {
                // 建立候選獎項
                let candidateAwards = [];
                awards.forEach((award, award_i) => {
                    let remainCount = parseInt( award["pickup_percent"] );
                    //console.log("remainCount=" + remainCount);
                    for(let rc_i = 0; rc_i < remainCount; rc_i++){
                        candidateAwards.push(award_i);
                    }
                });
                console.log("candidateAwards=", candidateAwards);
                selAwardObj = awards[ candidateAwards[ getRandomNumber(0, candidateAwards.length -1) ] ];
                console.log("selAwardObj=", selAwardObj);
            }

            // 利用 canvas 製作刮刮卡背景圖
            let base64Image_award = buildAwardCanvas(selAwardObj["display_text"]);
            // 製作刮刮卡
            buildScratchCardCanvas(base64Image_award);
            // 生成碎花片
            genConfetti();
        });
    }
    // 建立刮刮卡背景圖
    function buildAwardCanvas(awardText){
        let canvas_award = document.getElementById("awardCanvas");
        let container_award = document.getElementById('awardContainer');
        canvas_award.setAttribute("width", container_award.clientWidth);
        canvas_award.setAttribute("height", container_award.clientHeight);

        let ctx_award = canvas_award.getContext('2d');        
        ctx_award.font = "50px Arial"; // Sets font to 30px Arial
        ctx_award.textAlign = "center";
        ctx_award.textBaseline = "middle";
        ctx_award.fillText(awardText, canvas_award.width / 2, canvas_award.height / 2);

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
        ctx_card.arc(pos.x, pos.y, 20, 0, Math.PI * 2); // 繪製圓形作為刮開的區域
        ctx_card.fill();
    }
    // 領取獎勵
    function receiveAward(){
        isReceive.value = true;

        let paramObj = {
            op: "EDIT",
            name: selAwardObj["name"],
            display_text: selAwardObj["display_text"],
            count: selAwardObj["count"],
            pickup_percent: selAwardObj["pickup_percent"],
            receive_count: selAwardObj["receive_count"] + 1,
        };
        console.log("receiveAward.paramObj=", paramObj);
        let fetchReceiveAwardPromise = fetchData({
            api: "edit_awards",
            data: [ paramObj ],
        });
        Promise.all([fetchReceiveAwardPromise]).then((values) => {
            console.log("fetchReceiveAwardPromise.values=", values);
          
            // 將[刮刮卡]層全部變成透明
            ctx_card.globalCompositeOperation = 'destination-in';
            ctx_card.fillStyle = 'transparent'; // 塗層顏色，也可以用圖片
            ctx_card.fillRect(0, 0, canvas_card.width, canvas_card.height);

            // 控制 gsap animation
            let funContainer = document.getElementById("funContainer");
            console.log("funContainer.clientWidth=" + funContainer.clientWidth);
            console.log("funContainer.clientHeight=" + funContainer.clientHeight);
            gsapTimelines.forEach((timeline, tl_i) => {
                let tweenId = "tween_" + uniqueIds[tl_i];
                let targetElementId = "box_" + uniqueIds[tl_i];

                // kill timeline
                {
                    timeline.kill();
                    let boxElement = document.getElementById(targetElementId);
                    funContainer.appendChild(boxElement);
                    boxElement.style.opacity = 100;
                    boxElement.style.zIndex = 999;
                    boxElement.style.position = "fixed";
                }

                // 爆炸效果
                {
                    // 爆炸起點
                    let bombOriginalPoint = {
                        x: funContainer.clientWidth / 2 - 15,
                        y: funContainer.clientHeight / 2 - 15
                    };
                    // 計算爆炸終點
                    let bombTargetPoint = { x: 0, y: 0, };
                    {
                        bombTargetPoint.y = bombOriginalPoint.y - getRandomNumber(1, bombOriginalPoint.y);
                        let bombXOp = getRandomNumber(0, 1);
                        if(bombXOp === 0){
                            // 往左跑
                            bombTargetPoint.x = bombOriginalPoint.x - getRandomNumber(1, bombOriginalPoint.x);
                        }else{
                            // 往右跑
                            bombTargetPoint.x = bombOriginalPoint.x + getRandomNumber(1, bombOriginalPoint.x);
                        }
                    }
                    // 設定動畫
                    {
                        let bombTimeline = gsap.timeline({ yoyo:false, repeat: 0 });
                        // 移動到爆炸起點
                        bombTimeline.to("#" + targetElementId, {
                            x: bombOriginalPoint.x,
                            y: bombOriginalPoint.y,
                            rotation: 360,
                            duration: 0.5,
                        });
                        // 開始爆炸
                        bombTimeline.to("#" + targetElementId, {
                            x: bombTargetPoint.x,
                            y: bombTargetPoint.y,
                            rotation: 0,
                            duration: getRandomNumber(10, 20)/10,
                        });
                        bombTimeline.to("#" + targetElementId, {
                            rotation: 360,
                            duration: getRandomNumber(1, 10)/10,
                        });
                        // 漸漸消逝
                        bombTimeline.to("#" + targetElementId, {
                            opacity: 0,
                            duration: getRandomNumber(1, 10)/10,
                        });
                    }
                }
            });

        });
    }
    // 生成碎花片
    function genConfetti(){
        // 碎花片 - 候選顏色
        let boxColors = ["green", "blue", "purple", "gold", "peru", "blanchedalmond", "blueviolet", "goldenrod"];
        // 碎花片 - 數量上限
        let boxCount = 60;

        for(let bc_i = 1; bc_i <= 1; bc_i++){
            let boxContainer = document.getElementById("boxContainer" + bc_i);
            for(let box_i = 1; box_i <= boxCount; box_i++){
                let box_div = document.createElement("div");
                box_div.setAttribute("id", "box_" + bc_i + "_" + box_i);
                box_div.style.backgroundColor = boxColors[ box_i % boxColors.length ];
                box_div.style.width = "30px";
                box_div.style.height = "30px";

                boxContainer.append(box_div);
            }

            // 控制 gsap animation
            for(let box_i = 1; box_i <= boxCount; box_i++){
                let uniqueId = "" + bc_i + "_" + box_i;

                let tl = gsap.timeline({ yoyo: true, repeat: -1 });
                tl.to("#" + "box_" + uniqueId, {
                    id: "tween_" + uniqueId,
                    duration: getRandomNumber(10, 20)/10,
                    opacity: 0,
                });
                gsapTimelines.push(tl);

                uniqueIds.push(uniqueId);
            }
        }
    }

</script>

<template>

    <div id="funContainer" class="w-10/10 h-10/10 flex flex-col justify-center">
        <div class="w-10/10 h-1/10 flex flex-col justify-center">
            <div class="w-10/10 text-3xl">Lucky Me!</div>
            <div v-if="isReceive" class="w-10/10 text-2xl">You are so lucky~~</div> 
        </div>

        <!-- 刮刮卡 container -->
        <div id="scratchCardContainer" class="w-10/10 h-5/10 mt-2">
            <!-- 刮刮卡 -->
            <canvas id="scratchCardCanvas" style="cursor: crosshair;"></canvas>
        </div>

        <!-- 用來產生刮刮卡背景圖的 canvas -->
        <div id="awardContainer" class="w-10/10 h-5/10">
            <canvas id="awardCanvas"></canvas>
        </div>

        <div class="w-10/10 h-1/10 flex flex-row justify-center mt-2">
            <button v-if="!isReceive" class="btn btn-primary w-5/10" @click="receiveAward">
                領獎
            </button>
        </div>

        <div id="boxContainer1" class="w-10/10 h-1/10 flex flex-wrap justify-center mt-2">
        </div>

    </div>
</template>

<style scoped>

</style>
