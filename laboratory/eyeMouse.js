import { ref } from 'vue'

const template = `
<div class="relative w-full h-full">
  <!-- 模擬游標 -->
  <div ref="customCursor" v-show="!isLoading" class="custom-cursor"></div>

  <div class="w-full h-full flex flex-col items-center justify-center p-4">
    <div v-if="isLoading" class="text-center">
      <p class="text-2xl">正在載入模型，請稍候...</p>
      <span class="loading loading-dots loading-lg"></span>
    </div>

    <div v-show="!isLoading" class="relative w-full max-w-3xl">
      <video ref="videoEl" @play="onPlay" muted autoplay playsinline class="w-full h-auto rounded-lg shadow-lg"></video>
      <canvas ref="canvasEl" class="absolute top-0 left-0"></canvas>
    </div>
    <p v-if="errorMsg" class="text-red-500 mt-4">{{ errorMsg }}</p>
    <div v-show="!isLoading" class="mt-4 p-2 bg-gray-100 rounded">
      <p>請將頭部對準畫面中央，透過移動頭部來控制下方指標。</p>
      <p>快速眨眼來模擬點擊。(指標會閃爍)</p>
    </div>
  </div>
</div>
`;


export default {
    template: template,
    setup() {
        const videoEl = ref(null);
        const canvasEl = ref(null);
        const isLoading = ref(true);
        const errorMsg = ref('');

        // --- 眼動控制相關狀態 ---
        const customCursor = ref(null); // 模擬滑鼠的 DOM 元素
        const EYE_ASPECT_RATIO_THRESHOLD = 0.2; // 眨眼偵測閾值
        const BLINK_DEBOUNCE_FRAMES = 3; // 眨眼去抖動的幀數
        let eyeClosedCounter = 0;
        let isBlinking = false;
        // -------------------------

        let detectionInterval = null;

        // 初始化 component
        async function init() {
            try {
                // 載入 face-api.js 的模型
                // 確保您的模型檔案放在可公開訪問的 /models 路徑下
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/ai/faceapi/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/ai/faceapi/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/ai/faceapi/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/ai/faceapi/models')
                ]);
                console.log("模型載入完成");
                startVideo();
            } catch (err) {
                console.error("模型載入失敗:", err);
                errorMsg.value = "模型載入失敗，請檢查網路連線或模型路徑。";
                isLoading.value = false;
            }
        }

        // 啟動攝影機
        async function startVideo() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoEl.value) {
                    videoEl.value.srcObject = stream;
                }
            } catch (err) {
                console.error("無法啟動攝影機:", err);
                errorMsg.value = "無法啟動攝影機，請確認已授權瀏覽器使用。";
                isLoading.value = false;
            }
        }

        // 當影像開始播放時觸發
        function onPlay() {
            console.log("攝影機已啟動");
            isLoading.value = false;

            if (detectionInterval) clearInterval(detectionInterval);

            // 每 100 毫秒偵測一次
            detectionInterval = setInterval(async () => {
                if (!videoEl.value || !canvasEl.value) return;

                // --- 核心偵測與控制邏輯 ---
                handleDetection();

            }, 100);
        }

        // 取得兩點距離
        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }

        // 偵測處理函式
        async function handleDetection() {
            try {
                const video = videoEl.value;
                const canvas = canvasEl.value;

                // 設定 canvas 尺寸與 video 一致
                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                faceapi.matchDimensions(canvas, displaySize);

                // 進行偵測
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                                .withFaceLandmarks()
                                                .withFaceExpressions();

                // 將偵測結果繪製到 canvas 上
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                // faceapi.draw.drawFaceExpressions(canvas, resizedDetections); // 暫時關閉表情繪製，讓畫面乾淨些

                // --- 眼動控制邏輯 ---
                if (resizedDetections.length > 0) {
                    const landmarks = resizedDetections[0].landmarks;
                    const nose = landmarks.getNose(); // 使用鼻子作為頭部中心點
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();

                    // 1. 頭部位置控制滑鼠
                    moveCursorWithHead(nose[3], displaySize); // 鼻尖點

                    // 2. 眨眼偵測
                    detectBlink(leftEye, rightEye);
                }
            } catch (err) {
                console.error("偵測時發生錯誤:", err);
            }
        }

        // 根據頭部位置移動模擬游標
        function moveCursorWithHead(nosePosition, videoSize) {
            if (!customCursor.value) return;

            // 將頭部在影片中的座標，映射到整個網頁視窗
            // 為了簡化，我們只做線性映射
            // (0,0) 是左上角, (videoSize.width, videoSize.height) 是右下角
            const cursorX = (nosePosition.x / videoSize.width) * window.innerWidth;
            const cursorY = (nosePosition.y / videoSize.height) * window.innerHeight;

            customCursor.value.style.left = `${cursorX}px`;
            customCursor.value.style.top = `${cursorY}px`;
        }

        // 偵測眨眼
        function detectBlink(leftEye, rightEye) {
            const leftEAR = getEyeAspectRatio(leftEye);
            const rightEAR = getEyeAspectRatio(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;

            if (avgEAR < EYE_ASPECT_RATIO_THRESHOLD) {
                eyeClosedCounter++;
            } else {
                if (eyeClosedCounter > 0 && eyeClosedCounter <= BLINK_DEBOUNCE_FRAMES) {
                    // 這被視為一次有效的眨眼
                    triggerClick();
                }
                eyeClosedCounter = 0;
            }
        }

        // 計算單眼的 Eye Aspect Ratio (EAR)
        function getEyeAspectRatio(eye) {
            // EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
            const verticalDist1 = getDistance(eye[1], eye[5]);
            const verticalDist2 = getDistance(eye[2], eye[4]);
            const horizontalDist = getDistance(eye[0], eye[3]);
            return (verticalDist1 + verticalDist2) / (2.0 * horizontalDist);
        }

        // 觸發點擊效果
        function triggerClick() {
            console.log("偵測到點擊 (Blink)!");
            if (!customCursor.value) return;

            // 讓游標閃爍一下來表示點擊
            customCursor.value.classList.add('cursor-click');
            setTimeout(() => {
                customCursor.value.classList.remove('cursor-click');
            }, 300);
        }

        return {
            videoEl,
            canvasEl,
            isLoading,
            errorMsg,
            customCursor,

            init,
            onPlay,
        }
    },
    mounted() {
        console.log("eye-mouse.mounted");
        this.init();
    },
    beforeUnmount() {
        console.log("eye-mouse.beforeUnmount");
        // 元件銷毀前，清除 interval 並關閉攝影機
        if (detectionInterval) clearInterval(detectionInterval);
        if (this.videoEl && this.videoEl.srcObject) {
            this.videoEl.srcObject.getTracks().forEach(track => track.stop());
        }
    },
}
