import { ref, onMounted, onBeforeUnmount } from 'vue'

const template = `
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
</div>
`;


export default {
    template: template,
    setup() {
        const videoEl = ref(null);
        const canvasEl = ref(null);
        const isLoading = ref(true);
        const errorMsg = ref('');
        let detectionInterval = null;

        // 初始化 component
        async function init() {
            try {
                // 載入 face-api.js 的模型
                // 確保您的模型檔案放在可公開訪問的 /models 路徑下
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
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
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            }, 100);
        }

        return {
            videoEl,
            canvasEl,
            isLoading,
            errorMsg,

            init,
            onPlay,
        }
    },
    mounted() {
        console.log("machineLearning.mounted");
        this.init();
    },
    onBeforeUnmount() {
        // 元件銷毀前，清除 interval 並關閉攝影機
        if (this.detectionInterval) clearInterval(this.detectionInterval);
        if (this.videoEl && this.videoEl.srcObject) {
            this.videoEl.srcObject.getTracks().forEach(track => track.stop());
        }
    },
}