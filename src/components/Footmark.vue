<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import moment from 'moment'
    import { fetchData } from "@/composables/fetchData"
    import { GoogleMap, AdvancedMarker, CustomControl } from 'vue3-google-map'

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
        belong_to_user: "BRYANT",
    });

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
                    position: { lat: fmObj["latitude"], lng: fmObj["longitude"] }
                });

                googleMapMarkPins.push({
                    background: fmObj["type"] === "ByGogoro" ? "orange" : "purple",
                });
            });

        });
    }
    // 開啟編輯 modal
    function openEditModal(){
        document.getElementById("editMarkModal").showModal();
    }
    // 關閉編輯 modal
    function closeEditModal(){
        document.getElementById("editMarkModal").close();
    }
    // 儲存 Mark 資訊
    function saveMark(){
        if(!editObj.location_name || !editObj.mark_date || !editObj.type){
            opObj.status = false;
            opObj.message = "請填好資料再新增!";

            document.getElementById("alertMsg").classList.remove("hidden");

            setTimeout(() => {
                document.getElementById("alertMsg").classList.add("hidden");
            }, 3000);
            return;
        }

        console.log("saveMark.editObj=", editObj);



        closeEditModal();
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
            
            <AdvancedMarker v-for="(markObj, m_i) in googleMapMarks" :options="markObj" :pin-options="googleMapMarkPins[m_i]"></AdvancedMarker>        
        
            <CustomControl v-if="false" position="TOP_LEFT">
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

    <div id="alertMsg" class="toast hidden w-5/10">
        <div class="alert w-10/10" :class="{ 'alert-success': opObj.status == true, 'alert-error': opObj.status == false }">
            <span>{{ opObj.message }}</span>
        </div>
    </div>
</template>

<style scoped>

</style>
