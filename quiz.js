import { ref, reactive } from 'vue'

export default {
    setup() {
        const appState = ref("QUIZ")
        const quizCount = ref(10)
        const quizMaxNum = ref(10)
        const showCheck = ref(true)
        const checkRst = ref("")
        const quizs = reactive([])
        const quizTypes = reactive({
            add: true,
            sub: true,
            mul: true,
            div: false
        });

        // 設定題型
        function setQuiz(event){
            //console.log("setQuiz", event);
            appState.value = "SET";
        }
        // 設定題目數量
        function setQuizCount(event){
            quizCount.value = event.target.value;
        }
        // 設定產生題目時最大可能出現的數字
        function setQuizMaxNum(event){
            quizMaxNum.value = event.target.value;
        }
        // 產生 quiz 清單
        function generateQuiz(event){
            appState.value = "QUIZ";

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
                let q_left = Math.floor(Math.random() * quizMaxNum.value) + 1;
                let q_right = Math.floor(Math.random() * quizMaxNum.value) + 1;
                let q_op = quizOps[Math.floor(Math.random() * quizOps.length)];
                let q_op_for_ui = q_op === "*" ? "×" : q_op === "/" ? "÷" : q_op;
                
                let quizObj = {
                    quiz: q_left + " " + q_op_for_ui + " " + q_right + " = ",
                    real_answer: eval(q_left + " " + q_op + " " + q_right),
                    user_answer: 0,
                    result: false,
                    answered: false,
                    inputAnsId: "ans_" + q_i,
                    quizCard: "quiz_" + q_i,
                    preQuizCard: "#quiz_" + (q_i - 1 < 0 ? 0 : q_i -1),
                    nextQuizCard: "#quiz_" + (q_i + 1 === quizCount.value ? quizCount.value -1 : q_i+1),
                };
                quizs.push( quizObj );
            }

            checkRst.value = "";
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
        }
        // 驗證答案
        function checkAns(event){
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


            checkRst.value = "正確: " + correctCount + " / 錯誤: " + wrongCount + " / 未答: " + noneCount;
        }
        // 改變題型
        function changeQuizType(event, type) {
            //console.log("changeQuizType", event, type);

            quizTypes[type] = event.target.checked;
        }

        return {
            appState,
            quizCount,
            quizMaxNum,
            showCheck,
            checkRst,
            quizs,
            quizTypes,

            setQuiz,
            setQuizCount,
            setQuizMaxNum,
            generateQuiz,
            changeAns,
            changeQuizType,
            checkAns,
        }
    },
    template: `

<div class="flex items-center border-b mt-10 pb-5">
    <a href="#" @click="setQuiz" class="inline-flex items-center justify-center px-3 py-2 me-3 text-xs font-medium text-gray-900 bg-red-300 border border-gray-200 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:ring-2 hover:ring-black focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-100 ">
        <svg class="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
        </svg>
        設定題型
    </a>
    <a href="#" @click="generateQuiz" class="inline-flex items-center justify-center px-3 py-2 me-3 text-xs font-medium text-gray-900 bg-orange-300 border border-gray-200 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:ring-2 hover:ring-black focus:outline-none focus:z-10 focus:ring-4 focus:ring-gray-100 ">
        <svg class="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M9 1.334C7.06.594 1.646-.84.293.653a1.158 1.158 0 0 0-.293.77v13.973c0 .193.046.383.134.55.088.167.214.306.366.403a.932.932 0 0 0 .5.147c.176 0 .348-.05.5-.147 1.059-.32 6.265.851 7.5 1.65V1.334ZM19.707.653C18.353-.84 12.94.593 11 1.333V18c1.234-.799 6.436-1.968 7.5-1.65a.931.931 0 0 0 .5.147.931.931 0 0 0 .5-.148c.152-.096.279-.235.366-.403.088-.167.134-.357.134-.55V1.423a1.158 1.158 0 0 0-.293-.77Z"/>
        </svg> 
        產生題目
    </a>
    <a href="#" v-if="showCheck" @click="checkAns" class="inline-flex items-center justify-center px-3 py-2 me-2 text-xs font-medium text-gray-900 bg-yellow-300 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:ring-2 hover:ring-black focus:ring-4 focus:ring-blue-300 focus:outline-none ">
        <svg class="w-3 h-3 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"/>
        </svg>
        總計
    </a>
    <span v-if="showCheck" class="pl-8">
        {{ checkRst }}
    </span>
</div>

<!-- 設定題型 -->
<div v-if="appState=='SET'" class="w-full justify-items-center">
    <div class="p-4 space-y-4">
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
        <div class="w-full">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">題目數量:</legend>
                <input type="number" class="input" placeholder="請輸入" :value="quizCount" @change="setQuizCount" />
            </fieldset>
        </div>
        <div class="w-full">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">題目中可能的最大數字: </legend>
                <input type="number" class="input" placeholder="請輸入" :value="quizMaxNum" @change="setQuizMaxNum" />
            </fieldset>
        </div>
    </div>
</div>

<!-- 題目卡片 -->
<div v-if="appState=='QUIZ'" class="w-full justify-items-center">
    <div class="carousel carousel-vertical rounded-box h-96 w-full">
        <div v-for="(quizObj, index) in quizs" :id="quizObj.quizCard" class="carousel-item h-full w-full flex items-center justify-center">

            <div class="card w-96 bg-gray-200 card-xl shadow-sm text-black ">
                <div class="card-body">
                    <h2 class="card-title">Q{{ index + 1 }}.</h2>
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

                </div>
            </div>
        </div>
    </div>
</div>
  `
}