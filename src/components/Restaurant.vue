<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { fetchData } from "@/composables/fetchData"
    import { GoogleMap, Marker } from 'vue3-google-map'

    const props = defineProps({
        title: String,
        account: String,
        googleMapApiKey: String,
    })

    onMounted(() => {
        console.log("Meal mounted.");
        init();
    });

    let componentState = ref("STOP_CHANGE_CARD");
    let changeCardIntervalId = ref(null);
    let turnOverDuration = ref(2000);
    let showHandChangeCard = ref(true);
    let restCards = reactive([]);
    let restaurants = [];
    
    let googleMapCenter = reactive({
        lat: 0, lng:0
    });
    let googleMapMakerOptions = reactive({
        position: {
            lat: 0, lng: 0
        }
    });
    let googleMapSetting = reactive({
       center_lat: 0,
       center_lng: 0, 
    });
    
    // 初始化 component
    function init(){
        console.log("restaurants.init");
        console.log("props.title=", props.title);
        console.log("props.account=", props.account);
        console.log("props.googleMapApiKey=", props.googleMapApiKey);

        fetchRestaurant();
    }
    // 取得 restaurant 資料
    function fetchRestaurant(){
        let fetchRestaurantPromise = fetchData({
            api: "get_restaurants",
        });
        Promise.all([fetchRestaurantPromise]).then((values) => {
            console.log("fetchRestaurantPromise.values=", values);
            restaurants = values[0];
            genRestCards();
        });
    }
    // 依序產生 rest 清單
    function genRestCards(){
        // 開啟"系統處理中 mask"
        $("#loading").show();

        let isOriginalChecked = false;
        // 暫停翻卡動作
        if($("#iptToggle").is(":checked")){
            isOriginalChecked = true;
            $('#iptToggle').prop('checked', false);
        }
        // 清空 restCards
        restCards.splice(0, restCards.length);

        let createdRestIndex = [];
        while(createdRestIndex.length < restaurants.length){
            let random_m_i = Math.floor(Math.random() * restaurants.length);

            if(createdRestIndex.indexOf(random_m_i) < 0){
                createdRestIndex.push(random_m_i);

                let restObj = restaurants[random_m_i];
                restCards.push(restObj);
            }
        }

        // 關閉"系統處理中 mask"
        $("#loading").hide();

        // 將翻卡開關設定回原來狀態
        $('#iptToggle').prop('checked', isOriginalChecked);

        // 準備畫 google map
        drawMap(restCards[0].name, parseFloat(restCards[0].latitude), parseFloat(restCards[0].longitude));

    }
    // 自動翻卡開關
    function toggleChangeCard(event){
        //console.log("toggleChangeCard", event);

        if( event.target.checked ){
            showHandChangeCard.value = false;

            // 開始翻卡動作
            componentState.value = "START_CHANGE_CARD";
            if(!changeCardIntervalId.value){
                changeCardIntervalId.value = setInterval(nextRestCard, turnOverDuration.value);
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
    function nextRestCard(){
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

                let top1Card = restCards.splice(0, 1)[0];
                restCards.push(top1Card);

                clearInterval(turnOverId);
                turnOverId = null;

                // 準備畫 google map
                drawMap(restCards[0].name, parseFloat(restCards[0].latitude), parseFloat(restCards[0].longitude));

            }
            turnOver_count += 1;
        }, 100);
    }
    // 手動翻卡
    function handChangeCard(event){
        nextRestCard();
    }
    // 選定一張 rest card
    function selectCard(sel_restObj){
        console.log("selectCard", sel_restObj);
    }
    // 畫 Google Map
    async function drawMap(restaurantName, lat, lng){
        console.log("drawMap", lat, lng);
        if(lat && lng){
            googleMapCenter.lat = lat;
            googleMapCenter.lng = lng;

            googleMapMakerOptions.position.lat = lat;
            googleMapMakerOptions.position.lng = lng;
        }
    }

</script>

<template>

<div class="w-10/10 h-2/10 flex flex-col">
    <div class="stack h-8/10 w-10/10 ">
        <div v-for="(restObj, m_i) in restCards" @click="selectCard(restObj)" class="w-10/10 h-10/10 bg-gray-100/100 text-gray-900/100 p-4 border rounded-box cursor-pointer"
                                                :class="{'origin-top transition-transform duration-1300 ease rotate-x-180': componentState === 'TURN_UP' && m_i === 0,
                                                            'transition-discrete opacity-0 duration-2000 ease': componentState === 'FADE_OUT' && m_i === 0,
                                                            'transition-none hidden': componentState === 'HIDDEN' && m_i === 0,
                                                            'transition-none opacity-100': componentState === 'CHANGE_CARD' && m_i === 0, }" >
            <div class="w-10/10 text-xl">
                {{ restObj.name }}
            </div>
            <div class="w-10/10 text-xs flex items-center">
                ( {{ restObj.address }} )
                <svg class="w-6 h-6 text-gray-800 animate-bounce" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"/>
                </svg>
            </div>
        </div>
    </div>
    <div class="w-10/10 h-2/10 mt-5 text-center">
        <label class="label">
            <input id="iptToggle" type="checkbox" @click="toggleChangeCard" class="toggle toggle-primary" />
            自動翻卡
        </label>
    </div>
</div>
<div class="w-10/10 h-7/10 content-center p-2">
    <GoogleMap class="w-10/10 h-6/10"
        :api-key="props.googleMapApiKey"
        :center="googleMapCenter"
        :zoom="17">
        <Marker :options="googleMapMakerOptions"></Marker>        
    </GoogleMap>
</div>
<div class="w-10/10 h-1/10 flex flex-row gap-2">
    <div class="h-10/10" :class="{ 'w-5/10': showHandChangeCard, 'w-10/10': !showHandChangeCard }">
        <a class="btn bg-success w-10/10 h-10/10 rounded-lg" @click="genRestCards">
            打亂順序
        </a>
    </div>
    <div v-if="showHandChangeCard" class="w-5/10 h-10/10">
        <a class="btn bg-primary text-white w-10/10 h-10/10 rounded-lg" @click="handChangeCard">
            翻至下一張卡
        </a>
    </div>
</div>

</template>

<style scoped>

</style>
