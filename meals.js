import { ref, reactive } from 'vue'

export default {
    setup() {
        let componentState = ref("STOP_CHANGE_CARD");
        let changeCardIntervalId = ref(null);
        let turnOverDuration = ref(2000);
        let restaurantInfo = reactive([]);
        let meals = reactive([]);
        let mealCards = reactive([]);

        // 初始化 component
        function init(mealJsonObj, restaurantJsonObj){
            console.log("meals.init", mealJsonObj, restaurantJsonObj);

            meals = mealJsonObj;
            restaurantInfo = restaurantJsonObj;
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
            while(createdMealIndex.length < meals.length){
                let random_m_i = Math.floor(Math.random() * meals.length);

                if(createdMealIndex.indexOf(random_m_i) < 0){
                    createdMealIndex.push(random_m_i);

                    let mealObj = meals[random_m_i];
                    // find location of restaurant
                    let location = "";
                    restaurantInfo.forEach((restObj, r_i) => {
                        if(restObj["restaurant"] === mealObj["restaurant"]){
                            location = restObj["location"];
                        }
                    });

                    mealCards.push({
                        meal: mealObj["meal"],
                        restaurant: mealObj["restaurant"],
                        location: location,
                    });
                }
            }
            
            // 關閉"系統處理中 mask"
            $("#loading").hide();

            // 將翻卡開關設定回原來狀態
            $('#iptToggle').prop('checked', isOriginalChecked);
        }
        // 翻卡開關
        function toggleChangeCard(event){
            //console.log("toggleChangeCard", event);

            if( event.target.checked ){
                // 開始翻卡動作
                componentState.value = "START_CHANGE_CARD";
                if(!changeCardIntervalId.value){
                    changeCardIntervalId.value = setInterval(nextMealCard, turnOverDuration.value);
                }
            }else{
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

        return {
            componentState,
            mealCards,

            init,
            genMealCards,
            toggleChangeCard,
        }
    },
    created(){
        console.log("meals.created");
    },
    mounted(){
        console.log("meals.mounted");

        // 取得系統資料
        let fetchMeal = fetchJson("meal.json");
        let fetchRestaurant = fetchJson("restaurant.json");
        Promise.all([fetchMeal, fetchRestaurant]).then((values) => {
            //console.log(values); 
            let mealJsonObj = values[0];
            let restaurantJsonObj = values[1];
            this.init(mealJsonObj, restaurantJsonObj);

            // mount 後, 生成 mealCards
             this.genMealCards();
        });
    },
    template: `

<div class="w-full h-10/10 overflow-y-auto grid grid-rows-2">
    <div class="w-10/10 h-10/10 grid grid-cols-1 justify-items-center border-b border-gray-500/100 shadow-lg">
        <div class="stack w-2/10 h-10/10 mt-3">
            <div v-for="(mealObj, m_i) in mealCards" class="w-10/10 h-10/10 bg-gray-100/100 text-gray-900/100 flex justify-center items-center border rounded-box"
                                                    :class="{'origin-top transition-transform duration-1300 ease rotate-x-180': componentState === 'TURN_UP' && m_i === 0, 
                                                             'transition-discrete opacity-0 duration-2000 ease': componentState === 'FADE_OUT' && m_i === 0,
                                                             'transition-none hidden': componentState === 'HIDDEN' && m_i === 0,
                                                             'transition-none opacity-100': componentState === 'CHANGE_CARD' && m_i === 0, }" >
                <h2 class="">
                    {{ mealObj.meal }}
                </h2>
            </div>
        </div>
        <div class="w-10/10 h-10/10 mt-7 grid grid-cols-2 justify-items-center gap-2">
            <div class="w-10/10 h-10/10 mt-7 grid grid-cols-1 justify-items-end items-start">
                <label class="label mt-2">
                    <input id="iptToggle" type="checkbox" @click="toggleChangeCard" class="toggle toggle-primary" />
                    翻卡
                </label>
            </div>
            <div class="w-10/10 h-10/10 mt-7 grid grid-cols-1 justify-items-start">
                <a class="btn" @click="genMealCards">
                    打亂順序
                </a>
            </div>
        </div>
    </div>


</div>

  `
}