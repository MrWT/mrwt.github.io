import { ref, reactive, defineProps } from 'vue'

const template = `

<div class="w-full h-10/10 overflow-y-auto grid grid-rows-2 gap-4">
    <div class="w-10/10 h-10/10 grid grid-cols-1 justify-items-center border-b border-gray-500/100 shadow-lg">
        <div class="stack h-7/10 w-8/10 mt-15 md:w-5/10 md:h-8/10 md:mt-5">
            <div v-for="(mealObj, m_i) in mealCards" @click="selectCard(mealObj)" class="w-10/10 h-10/10 bg-gray-100/100 text-gray-900/100 p-4 border rounded-box cursor-pointer"
                                                    :class="{'origin-top transition-transform duration-1300 ease rotate-x-180': componentState === 'TURN_UP' && m_i === 0, 
                                                             'transition-discrete opacity-0 duration-2000 ease': componentState === 'FADE_OUT' && m_i === 0,
                                                             'transition-none hidden': componentState === 'HIDDEN' && m_i === 0,
                                                             'transition-none opacity-100': componentState === 'CHANGE_CARD' && m_i === 0, }" >
                <div class="w-10/10 text-xl">
                    {{ mealObj.name }}
                </div>
                <div class="w-10/10 text-md">
                    {{ mealObj.restaurant.name }}
                </div>
                <div class="w-10/10 text-xs flex items-center">
                    ( {{ mealObj.restaurant.address }} )
                    <svg class="w-6 h-6 text-gray-800 animate-bounce" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"/>
                    </svg>
                </div>
            </div>
        </div>
        <div class="w-10/10 h-10/10 grid grid-cols-3 md:grid-cols-5 justify-items-center gap-4">
            <div class="w-10/10 h-10/10 md:col-start-2 grid grid-cols-1 justify-items-center items-center">
                <label class="label mt-2">
                    <input id="iptToggle" type="checkbox" @click="toggleChangeCard" class="toggle toggle-primary" />
                    自動翻卡
                </label>
            </div>
            <div class="w-10/10 h-10/10 grid grid-cols-1 justify-items-center items-center">
                <a class="btn bg-success" @click="genMealCards">
                    打亂順序
                </a>
            </div>
            <div v-if="showHandChangeCard" class="w-10/10 h-10/10 grid grid-cols-1 justify-items-center items-center">
                <a class="btn bg-primary text-white" @click="handChangeCard">
                    翻至下一張卡
                </a>
            </div>
        </div>
    </div>
    <div class="w-10/10 h-10/10 grid grid-cols-3 ">
        <div class="w-10/10 h-10/10 col-start-2 flex flex-col gap-4">
            <div class="skeleton h-32 w-full"></div>
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
        </div>
    </div>

</div>

  `;

export default {
    props: ['title', 'meals'],
    template: template,
    setup(props) {
        let componentState = ref("STOP_CHANGE_CARD");
        let changeCardIntervalId = ref(null);
        let turnOverDuration = ref(2000);
        let showHandChangeCard = ref(true);
        let mealCards = reactive([]);

        // 初始化 component
        function init(){
            console.log("meals.init");
            console.log("props.meals=", props.meals);

            genMealCards();
        }
        // 依序產生 meal 清單
        function genMealCards(){
            // 開啟"系統處理中 mask"
            $("#loading").show();

            let isOriginalChecked = false;
            // 暫停翻卡動作
            if($("#iptToggle").is(":checked")){
                isOriginalChecked = true;
                $('#iptToggle').prop('checked', false);
            }
            // 清空 mealCards
            mealCards.splice(0, mealCards.length);

            let createdMealIndex = [];
            while(createdMealIndex.length < props.meals.length){
                let random_m_i = Math.floor(Math.random() * props.meals.length);

                if(createdMealIndex.indexOf(random_m_i) < 0){
                    createdMealIndex.push(random_m_i);

                    let mealObj = props.meals[random_m_i];
                    mealCards.push(mealObj);
                }
            }
            
            // 關閉"系統處理中 mask"
            $("#loading").hide();

            // 將翻卡開關設定回原來狀態
            $('#iptToggle').prop('checked', isOriginalChecked);
        }
        // 自動翻卡開關
        function toggleChangeCard(event){
            //console.log("toggleChangeCard", event);

            if( event.target.checked ){
                showHandChangeCard.value = false;

                // 開始翻卡動作
                componentState.value = "START_CHANGE_CARD";
                if(!changeCardIntervalId.value){
                    changeCardIntervalId.value = setInterval(nextMealCard, turnOverDuration.value);
                }
            }else{
                showHandChangeCard.value = true;

                // 停止翻卡動作
                componentState.value = "STOP_CHANGE_CARD";
                clearInterval(changeCardIntervalId.value);
                changeCardIntervalId.value = null;
            }
        }
        // 翻至下一張
        function nextMealCard(){
            let turnOver_count = 0;            
            let turnOverId = setInterval(() => {
                if(turnOver_count <= 13){
                    componentState.value = "TURN_UP";
                }else if(14 <= turnOver_count && turnOver_count <= 15){
                    componentState.value = "FADE_OUT";
                }else if(16 <= turnOver_count && turnOver_count <= 18){
                    componentState.value = "HIDDEN";
                }else if(turnOver_count === 19){
                    componentState.value = "CHANGE_CARD";

                    let top1Card = mealCards.splice(0, 1)[0];
                    mealCards.push(top1Card);

                    clearInterval(turnOverId);
                    turnOverId = null;
                }
                turnOver_count += 1;
            }, 100);
        }
        // 手動翻卡
        function handChangeCard(event){
            nextMealCard();
        }
        // 選定一張 meal card
        function selectCard(sel_mealObj){
            console.log("selectCard", sel_mealObj);
        }

        return {
            componentState,
            mealCards,
            showHandChangeCard,

            init,
            genMealCards,
            toggleChangeCard,
            selectCard,
            handChangeCard,
        }
    },
    created(){
        console.log("meals.created");
    },
    mounted(){
        console.log("meals.mounted");

        this.init();
    },
}