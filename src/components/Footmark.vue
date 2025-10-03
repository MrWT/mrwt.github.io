<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import moment from 'moment'
    import { fetchData } from "@/composables/fetchData"
    import { GoogleMap, AdvancedMarker, CustomControl, InfoWindow } from 'vue3-google-map'

    const emit = defineEmits(['popupMessage']);
    const props = defineProps({
        title: String,
        account: String,
        googleMapApiKey: String,
    })

    onMounted(() => {
        console.log("Footmark mounted.");
        init();
    });
    
    // screen size
    let screenSize = ref("md");
    // google map 初始中心點 - 台灣地理中心碑
    let googleMapCenter = reactive({
        lat: 23.974174340321614, lng: 120.97984968163026
    });
    // google map mark
    let googleMapMarks = reactive([]);
    // style of mark
    let googleMapMarkPins = reactive([]);
    // 編輯 object
    let editObj = reactive({
        location_name: "",
        latitude: 0,
        longitude: 0,
        type: "ByGogoro",
        mark_date: moment().format("YYYY-MM-DD"),
        belong_to_user: props.account.toUpperCase(),
        memo: "",
    });
    // 編輯狀態
    let opObj = reactive({
        status: true,
        message: "",
    });
    
    // 初始化 component
    function init(){
        console.log("travel.init");
        console.log("props.title=", props.title);
        console.log("props.account=", props.account);
        console.log("props.googleMapApiKey=", props.googleMapApiKey);

        // w-sm 約等於 384px
        // w-md 約等於 448px
        if(window.innerWidth > 448){
            screenSize.value = "md";
        }else if(304 < window.innerWidth && window.innerWidth < 448 ){
            screenSize.value = "sm";
        }else{
            screenSize.value = "xs";
        }

        fetchFootmark();
    }
    // 取得踩點足跡
    function fetchFootmark(){
        googleMapMarks.splice(0, googleMapMarks.length);
        googleMapMarkPins.splice(0, googleMapMarkPins.length);

        let fetchFootmarkPromise = fetchData({
            api: "get_footmark",
            data: {
                account: props.account,
            }
        });
        Promise.all([fetchFootmarkPromise]).then((values) => {
            console.log("fetchFootmarkPromise.values=", values);

            values[0].forEach((fmObj, fm_i) => {
                googleMapMarks.push({
                    location_name: fmObj["location_name"],
                    mark_date: fmObj["mark_date"],
                    type: fmObj["type"],
                    memo: fmObj["memo"],
                    marker: {
                        position: { lat: fmObj["latitude"], lng: fmObj["longitude"] },
                        title: fmObj["location_name"]
                    }
                });

                googleMapMarkPins.push({
                    background: fmObj["type"] === "ByGogoro" ? "red" : "pink",
                });
            });

            //console.log("googleMapMarks=", googleMapMarks);
            //console.log("googleMapMarkPins=", googleMapMarkPins);
        });
    }
    // 開啟編輯 modal
    function openEditModal(){
        document.getElementById("editMarkModal").showModal();

        editObj.location_name = "";
        editObj.mark_date = moment().format("YYYY-MM-DD");
        editObj.type = "ByGogoro";
        editObj.memo = "";
    }
    // 關閉編輯 modal
    function closeEditModal(){
        document.getElementById("editMarkModal").close();
    }
    // 儲存 Mark 資訊
    function saveMark(){
        // 資料檢核
        if(!editObj.location_name || !editObj.mark_date || !editObj.type){
            opObj.status = false;
            opObj.message = "請填好資料再新增!";

            emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data
            return;
        }

        // 新增 footmark
        console.log("saveMark.editObj=", editObj);
        let newFootmarkPromise = fetchData({
            api: "new_footmark",
            data: editObj
        });
        Promise.all([newFootmarkPromise]).then((values) => {
            console.log("newFootmarkPromise.values=", values);

            fetchFootmark();
            closeEditModal();
        });
    }
</script>

<template>

    <div class="w-10/10 h-10/10 p-1">
        <GoogleMap class="w-10/10 h-10/10"
            mapId="DEMO_MAP_ID"
            :api-key="props.googleMapApiKey"
            :center="googleMapCenter"
            :zoom="7"
            :mapTypeControl = "false" 
            :streetViewControl = "false"
            >
            
            <AdvancedMarker v-for="(markObj, m_i) in googleMapMarks" :options="markObj.marker" :pin-options="googleMapMarkPins[m_i]">
                <InfoWindow class="flex flex-col gap-2 pr-5">
                    <h3 class="text-lg text-black">{{ markObj.mark_date }}</h3>    
                    <h1 class="text-2xl text-black">{{ markObj.location_name }}</h1>    
                    <h3 class="text-base text-black">{{ markObj.memo }}</h3>    
                </InfoWindow>
            </AdvancedMarker>        
        
            <CustomControl v-if="true" position="TOP_LEFT">
                <button class="custom-btn p-3" @click="openEditModal">
                    <svg class="w-8 h-8 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.583 8.445h.01M10.86 19.71l-6.573-6.63a.993.993 0 0 1 0-1.4l7.329-7.394A.98.98 0 0 1 12.31 4l5.734.007A1.968 1.968 0 0 1 20 5.983v5.5a.992.992 0 0 1-.316.727l-7.44 7.5a.974.974 0 0 1-1.384.001Z"/>
                    </svg>
                </button>
            </CustomControl>
        </GoogleMap>
    </div>

    <!-- 編輯 mark modal -->
    <dialog id="editMarkModal" class="modal">
        <div class="modal-box bg-gray-800/80 rounded-box p-2 w-8/10 md:w-200 flex flex-col gap-6">
            <input type="text" placeholder="地點名稱" class="input input-info w-10/10" v-model="editObj.location_name" />

            <input type="date" placeholder="踩點日期" class="input input-info w-10/10" v-model="editObj.mark_date" />

            <input type="text" placeholder="備註" class="input input-info w-10/10" v-model="editObj.memo" />

            <div class="flex flex-row gap-2 w-10/10">
                <label class="text-white text-lg w-5/10">
                    <input type="radio" v-model="editObj.type" value="ByGogoro" checked />
                    電車踩點
                </label>
                <label class="text-white text-lg w-5/10">
                    <input type="radio" v-model="editObj.type" value="WithFamily" />
                    家庭旅遊
                </label>
            </div>

            <div class="flex flex-row gap-2 w-10/10">
                <button class="btn w-5/10" @click="saveMark">
                    New
                </button>
                <button class="btn w-5/10" @click="closeEditModal">
                    Close
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>

</template>

<style scoped>

</style>
