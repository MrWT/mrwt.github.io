<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { getRandomNumber } from "@/composables/random"

    const props = defineProps({
        title: String,
        account: String,
        setting: Object
    });

    onMounted(() => {
        console.log("Quiz mounted.");
        init();
    });

    let appState = ref("");
    let quizCount = ref(0);
    let quizMaxNum = ref(0);
    let correctAns = ref(0);
    let wrongAns = ref(0);
    let noneAns = ref(0);
    let quizs = reactive([]);
    let quizTypes = reactive({
        add: true,
        sub: true,
        mul: true,
        div: false
    });

    // 初始化 component
    function init(){
        console.log("quiz.init");
        console.log("props.setting=", props.setting);

        quizCount.value = props.setting["count"];
        quizMaxNum.value = props.setting["max_number"];

        generateQuiz();
    }
    // 改變題型
    function changeQuizType(event, type) {
        //console.log("changeQuizType", event, type);

        quizTypes[type] = event.target.checked;

        generateQuiz();
    }
    // 設定題目數量
    function setQuizCount(event){
        quizCount.value = event.target.value;

        generateQuiz();
    }
    // 設定產生題目時最大可能出現的數字
    function setQuizMaxNum(event){
        quizMaxNum.value = event.target.value;

        generateQuiz();
    }
    // 產生 quiz 清單
    function generateQuiz(event){
        // 開啟"系統處理中 mask"
        $("#loading").show();

        // 清空 quizs
        quizs.splice(0, quizs.length);

        let quizOps = [];
        Object.keys(quizTypes).forEach((qz, qz_i) => {
            if(quizTypes[qz] && qz === "add"){
                quizOps.push("+");
            }
            if(quizTypes[qz] && qz === "sub"){
                quizOps.push("-");
            }
            if(quizTypes[qz] && qz === "mul"){
                quizOps.push("*");
            }
            if(quizTypes[qz] && qz === "div"){
                quizOps.push("/");
            }
        });
        
        for(let q_i = 0; q_i < quizCount.value; q_i++){
            let q_left = getRandomNumber(1, quizMaxNum.value);
            let q_right = getRandomNumber(1, quizMaxNum.value);
            let q_op = quizOps[ getRandomNumber(0, quizOps.length-1)];

            let q_op_for_ui = q_op === "*" ? "×" : q_op === "/" ? "÷" : q_op;

            // 減法, 除法時, 特別注意數字大小
            if(q_op === "-" || q_op === "/"){
                if(q_left < q_right){
                    let q_tmp = q_right;
                    q_right = q_left;
                    q_left = q_tmp;
                }
            }
            
            let quizObj = {
                quiz: q_left + " " + q_op_for_ui + " " + q_right + " = ",
                real_answer: eval(q_left + " " + q_op + " " + q_right),
                user_answer: 0,
                result: false,
                answered: false,
                inputAnsId: "ans_" + q_i,
                quizCard: "quiz_" + (q_i === quizCount.value -1 ? "final" : q_i),
                preQuizCard: "#quiz_" + (q_i - 1 < 0 ? 0 : q_i -1),
                nextQuizCard: "#quiz_" + (q_i + 1 === quizCount.value -1 ? "final" : q_i+1),
            };
            quizs.push( quizObj );
        }

        checkAns();

        // 關閉"系統處理中 mask"
        $("#loading").hide();
    }
    // answer input 改變時, 同步改變 quizs 中的 user_answer
    function changeAns(event){
        //console.log("changeAns", event, event.target.id, event.target.value);

        let targetEleId = event.target.id;
        let targetValue = event.target.value;

        let quizIndex = parseInt( targetEleId.split("_")[1] );
        quizs[quizIndex].answered = true;
        quizs[quizIndex].user_answer = parseInt( targetValue );
        quizs[quizIndex].result = parseInt(quizs[quizIndex].user_answer) === parseInt(quizs[quizIndex].real_answer);

        // 驗證答案
        checkAns();
    }
    // 驗證答案
    function checkAns(){
        let correctCount = 0;
        let wrongCount = 0;
        let noneCount = 0;

        quizs.forEach((quizObj, index) => {
            if(quizObj.answered){
                if(quizObj.result){
                    correctCount += 1;
                }else{
                    wrongCount += 1;
                }
            }else{
                noneCount += 1;
            }
        });

        correctAns.value = correctCount;
        wrongAns.value = wrongCount;
        noneAns.value = noneCount;
    }
    // 呈現答題結果清單
    function showCheckRstList(event){
        document.getElementById("accountingModal").showModal();

        setTimeout(function(){
            console.log("accountingModal.height=", $("#accountingModal").height() );
            $("#checkRstList").height( $("#accountingModal").height() * 0.8 );
        }, 100);
    }

</script>

<template>

<!-- 上方功能區塊 -->
<div class="border-b w-10/10 h-2/10 grid grid-flow-row-dense grid-cols-2 md:grid-cols-5">
    <a href="#" @click="generateQuiz" class="inline-flex items-center justify-center px-3 py-2 me-3 text-xs font-medium text-gray-900 bg-orange-300 border border-gray-200 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:ring-2 hover:ring-black focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-100 order-1">
        <svg class="w-6 h-6 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M9 1.334C7.06.594 1.646-.84.293.653a1.158 1.158 0 0 0-.293.77v13.973c0 .193.046.383.134.55.088.167.214.306.366.403a.932.932 0 0 0 .5.147c.176 0 .348-.05.5-.147 1.059-.32 6.265.851 7.5 1.65V1.334ZM19.707.653C18.353-.84 12.94.593 11 1.333V18c1.234-.799 6.436-1.968 7.5-1.65a.931.931 0 0 0 .5.147.931.931 0 0 0 .5-.148c.152-.096.279-.235.366-.403.088-.167.134-.357.134-.55V1.423a1.158 1.158 0 0 0-.293-.77Z"/>
        </svg>
        重新產生題目
    </a>
    <div class="flex justify-center items-center order-3 col-span-3 md:order-2">
        <div class="flex justify-center items-center text-xs mt-5 md:text-lg md:mt-0">
            <div>
                共有 {{ quizCount }} 題
            </div>
            <span class="mx-2">
                /
            </span>
            <div>
                正確 {{ correctAns }} 題
            </div>
            <span class="mx-2">
                /
            </span>
            <div :class="{'text-gray-900': wrongAns === 0, 'text-red-900': wrongAns > 0}" >
                錯誤 {{ wrongAns }} 題
            </div>
            <span class="mx-2">
                /
            </span>
            <div :class="{'text-gray-900': noneAns === 0, 'text-blue-900': noneAns > 0}" >
                未答 {{ noneAns }} 題
            </div>
        </div>

        <div class="tooltip tooltip-bottom">
            <div class="tooltip-content">
                <div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">核算答案!</div>
            </div>
            <a href="#"  @click="showCheckRstList" class="flex justify-center items-center ml-2 mt-5 md:mt-0">
                <svg class="w-6 h-6 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 18h14M5 18v3h14v-3M5 18l1-9h12l1 9M16 6v3m-4-3v3m-2-6h8v3h-8V3Zm-1 9h.01v.01H9V12Zm3 0h.01v.01H12V12Zm3 0h.01v.01H15V12Zm-6 3h.01v.01H9V15Zm3 0h.01v.01H12V15Zm3 0h.01v.01H15V15Z"/>
                </svg>
            </a>
        </div>
    </div>
    <a href="#" onclick="settingModal.showModal()" class="inline-flex items-center justify-center px-3 py-2 me-3 text-xs font-medium text-gray-900 bg-red-300 border border-gray-200 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:ring-2 hover:ring-black focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-100 order-2 md:order-3">
        <svg class="w-6 h-6 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
        </svg>
        題型設定
    </a>
</div>

<!-- 設定題型 -->
<dialog id="settingModal" class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button class="btn btn-sm btn-circle bg-black text-white absolute right-2 top-2">✕</button>
        </form>
        <div class="w-full">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">題型:</legend>

                <div class="join">
                    <label class="label mr-3 text-[20px]">
                        <input type="checkbox" checked="checked" class="checkbox" @click="changeQuizType($event, 'add')" />
                        加法
                    </label>
                    <label class="label mr-3 text-[20px]">
                        <input type="checkbox" checked="checked" class="checkbox" @click="changeQuizType($event, 'sub')" />
                        減法
                    </label>
                    <label class="label mr-3 text-[20px]">
                        <input type="checkbox" checked="checked" class="checkbox" @click="changeQuizType($event, 'mul')" />
                        乘法
                    </label>
                    <label class="label mr-3 text-[20px]">
                        <input type="checkbox" class="checkbox" disabled @click="changeQuizType($event, 'div')" />
                        除法
                    </label>
                </div>

            </fieldset>
        </div>
        <div class="flex justify-center items-center w-1/1 gap-2">
            <div class="w-1/2">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">題目數量:</legend>
                    <input type="number" class="input" placeholder="請輸入" :value="quizCount" @change="setQuizCount" />
                </fieldset>
            </div>
            <div class="w-1/2">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">題目中可能的最大數字: </legend>
                    <input type="number" class="input" placeholder="請輸入" :value="quizMaxNum" @change="setQuizMaxNum" />
                </fieldset>
            </div>
        </div>
    </div>
</dialog>

<!-- 題目卡片 -->
<div class="w-10/10 h-8/10 justify-items-center">
    <div class="carousel carousel-vertical rounded-box h-10/10 w-10/10">
        <div v-for="(quizObj, index) in quizs" :id="quizObj.quizCard" class="carousel-item h-10/10 w-10/10 flex items-center justify-center">

            <div class="card w-96 bg-gray-200 card-xl shadow-sm text-black ">
                <div class="card-body">
                    <h2 class="card-title">Q{{ index + 1 }} / {{ quizCount }}</h2>
                    <div class="flex items-center mb-4">
                        <p>{{ quizObj.quiz }}</p>
                        <input type="number" :id="quizObj.inputAnsId" @change="changeAns" :disabled="quizObj.answered" required placeholder="0"
                            class="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 w-30 p-2.5 mr-5 "
                            :class="{ 'border-red-500': !quizObj.result && quizObj.answered, 'border-blue-500': quizObj.result && quizObj.answered, 'border-gray-300': !quizObj.answered }" />

                        <svg v-if="quizObj.answered && quizObj.result" class="w-6 h-6 text-blue-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                        </svg>

                        <svg v-if="quizObj.answered && !quizObj.result" class="w-6 h-6 text-red-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </div>
                    <div class="justify-end card-actions">
                        <a v-if="quizObj.quizCard !== 'quiz_final'" class="btn bg-gray-500 text-white" :href="quizObj.nextQuizCard">下一題</a>
                        <a v-if="quizObj.quizCard === 'quiz_final'" class="btn bg-gray-500 text-white" @click="showCheckRstList">核算答案</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 核算答案 -->
<dialog id="accountingModal" class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button class="btn btn-sm btn-circle bg-black text-white absolute right-2 top-2">✕</button>
        </form>
        <div id="checkRstList" class="w-full">
            <ul class="list bg-base-100 rounded-box shadow-md h-10/10 overflow-y-auto">
                <li class="p-4 pb-2 text-lg opacity-100 tracking-wide">答案清單</li>

                <li v-for="(quizObj, index) in quizs" class="list-row">
                    <div class="text-4xl font-thin opacity-30 tabular-nums">{{ index + 1 < 10 ? "0" + (index + 1) : (index + 1) }}.</div>
                    <div class="text-4xl">
                        {{ quizObj.quiz }}{{ quizObj.user_answer }}
                    </div>
                    <div class="list-col-wrap">
                        <div v-if="!quizObj.answered" class="badge badge-outline badge-warning">
                            未作答
                        </div>

                        <div v-if="quizObj.answered && quizObj.result" class="badge badge-outline badge-success">
                            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                            </svg>
                        </div>

                        <div v-if="quizObj.answered && !quizObj.result" class="badge badge-outline badge-error">
                            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                            </svg>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</dialog>

</template>

<style scoped>

</style>
