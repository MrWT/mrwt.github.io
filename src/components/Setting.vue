<script setup>
    import { ref, reactive, onMounted } from 'vue'

    const props = defineProps({
        app_state: String,
        title: String,
        account: String,
        quiz_setting: Object,
    })

    onMounted(() => {
        console.log("Setting mounted.");
        init();
    });

    let appState = ref("");
    let finance = reactive({
        house: {
            target: 0,
        },
        credit: {
            target: 0,
            remain: 0,
        },
        deposit_Speed:{
            value1: 0,
            value2: 0,
        },
        deposit_TWD:{
            value: 0,
        },
        deposit_USD:{
            value: 0,
            currency: 0,
        },
        stock_nano:{
            value: 0,
            currency: 0,
        },
        stock_tw0056: {
            num: 0,
            price: 0,
        },
        stock_tw00878: {
            num: 0,
            price: 0,
        },
        stock_tw00919: {
            num: 0,
            price: 0,
        },
    });
    let quiz_setting = reactive({
        max_number: 0,
        count: 0,
    });
    let opObj = reactive({
        message: "",
        status: true,
    });
    let restaurants = reactive([]);
    let userObj = reactive({
        account: "",
        name: "",
        mail: "",
        app_title: "",
        language: "",
        role: "",
    });
    // language radio group 控制項
    let languageRadioParam = reactive({
        radioGroupName: 'rgLang', // 一致的 name 属性
        options: [
            { label: '英文', value: 'EN' },
            { label: '繁體中文', value: 'ZH_TW' }
        ],
        selectedOption: 'EN' // 預設選項
    });

    // 初始化 component
    function init(){
        console.log("setting.init");
        console.log("props.app_state", props.app_state);
        console.log("props.title", props.title);
        console.log("props.account", props.account);
        console.log("props.quiz_setting", props.quiz_setting);

        appState.value = props.app_state;
        setTimeout(() => {
            if(document.getElementsByName("setting_tabs").length > 0){
                console.log("setting_tabs=", document.getElementsByName("setting_tabs") );
                document.getElementsByName("setting_tabs")[0].click();
            }
        }, 200);

        quiz_setting.max_number = props.quiz_setting.max_number;
        quiz_setting.count = props.quiz_setting.count;

        // 取得資料
        if(appState.value === "SET_PERSON"){
            fetchFinance();
            fetchUser();
        }else{
            fetchRestaurant();
        }
    }
    // 取得使用者個人 finance 資料
    function fetchFinance(){
        let fetchFinancePromise = fetchData({
            api: "get_finance",
            data: {
                account: props.account,
            }
        });
        Promise.all([fetchFinancePromise]).then((values) => {
            console.log("fetchFinancePromise.values=", values);

            values[0].forEach((finObj, fin_i) => {
                if(finObj["name"] === "house"){
                    // 購屋資訊
                    finance.house.target = finObj["value1"];
                } else if(finObj["name"] === "credit"){
                    // 信貸資訊
                    finance.credit.target = finObj["value1"];
                    finance.credit.remain = finObj["value2"];
                } else if(finObj["name"] === "stock_0056"){
                    // 台股資訊
                    finance.stock_tw0056.num = finObj["value1"];
                    finance.stock_tw0056.price = finObj["value2"];
                } else if(finObj["name"] === "stock_00878"){
                    // 台股資訊
                    finance.stock_tw00878.num = finObj["value1"];
                    finance.stock_tw00878.price = finObj["value2"];
                } else if(finObj["name"] === "stock_00919"){
                    // 台股資訊
                    finance.stock_tw00919.num = finObj["value1"];
                    finance.stock_tw00919.price = finObj["value2"];
                } else if(finObj["name"] === "stock_nano"){
                    // 奈米投資訊
                    finance.stock_nano.value = finObj["value1"];
                    finance.stock_nano.currency = finObj["value2"];
                } else if(finObj["name"] === "speed"){
                    // 台幣存款速度
                    finance.deposit_Speed.value1 = finObj["value1"];
                    finance.deposit_Speed.value2 = finObj["value2"];
                } else if(finObj["name"] === "deposit" && finObj["currency"] === "TWD"){
                    // 台幣存款資訊
                    finance.deposit_TWD.value = finObj["value1"];
                } else if(finObj["name"] === "deposit" && finObj["currency"] === "USD"){
                    // 美金存款資訊
                    finance.deposit_USD.value = finObj["value1"];
                    finance.deposit_USD.currency = finObj["value2"];
                }
            });
        });
    }
    // 儲存 finance 設定資料
    function saveFinance(){
        console.log("saveFinance");

        let saveFinancePromise = fetchData({
            api: "save_finance",
            data: {
                finance: finance,
                account: props.account,
            }
        });
        Promise.all([saveFinancePromise]).then((values) => {
            console.log("saveFinancePromise.values=", values);

            opObj.status = values[0]["result"];
            if(values[0]["result"] === true){
                opObj.message = "儲存成功";
            }else{
                opObj.message = values[0]["message"];
            }
            document.getElementById("alertMsg").classList.remove("hidden");

            setTimeout(() => {
                document.getElementById("alertMsg").classList.add("hidden");
            }, 3000);
        });
    }
    // 儲存 quiz 設定資料
    function saveQuiz(){
        console.log("saveQuiz");

        let saveQuizPromise = fetchData({
            api: "save_quiz",
            data: quiz_setting
        });
        Promise.all([saveQuizPromise]).then((values) => {
            console.log("saveQuizPromise.values=", values);

            opObj.status = values[0]["result"];
            if(values[0]["result"] === true){
                opObj.message = "儲存成功";
            }else{
                opObj.message = values[0]["message"];
            }
            document.getElementById("alertMsg").classList.remove("hidden");

            setTimeout(() => {
                document.getElementById("alertMsg").classList.add("hidden");
            }, 3000);

        });
    }
    // 取得 restaurant 資料
    function fetchRestaurant(){
        let fetchRestaurantPromise = fetchData({
            api: "get_restaurants",
        });
        Promise.all([fetchRestaurantPromise]).then((values) => {
            console.log("fetchRestaurantPromise.values=", values);

            // 清空 restaurants
            restaurants.splice(0, restaurants.length);
            values[0].forEach((restObj, rest_i) => {
                restaurants.push({
                    name: restObj["name"],
                    longitude: restObj["longitude"],
                    latitude: restObj["latitude"],
                    address: restObj["address"],
                    edit_name: restObj["name"],
                    edit_longitude: restObj["longitude"],
                    edit_latitude: restObj["latitude"],
                    edit_address: restObj["address"],
                });
            });
            console.log("restaurants", restaurants);
        });
    }
        // 新增 restaurant 設定資料
    function newRestaurant(){
        //console.log("newRestaurant");

        restaurants.push({
            name: "NEW",
            address: "",
            latitude: 0,
            longitude: 0,
            edit_name: "",
            edit_address: "",
            edit_latitude: 0,
            edit_longitude: 0,
        });
    }
    // 儲存 restaurant 設定資料
    function saveRestaurant(){
        //console.log("saveRestaurant");

        restaurants.forEach((restObj, rest_i) => {
            let edit_address = restObj["edit_address"];
            let geoPromise = geocodeAddress(edit_address);
            Promise.all([geoPromise]).then((values) => {
                console.log("edit_address=" + edit_address + " / values=", values);
                restObj["edit_latitude"] = values[0].latitude;
                restObj["edit_longitude"] = values[0].longitude;
            });
        });
        console.log("saveRestaurant.restaurants=", restaurants);

        setTimeout(() => {
            let saveRestaurantPromise = fetchData({
                api: "save_restaurants",
                data: restaurants
            });
            Promise.all([saveRestaurantPromise]).then((values) => {
                console.log("saveRestaurantPromise.values=", values);

                opObj.status = values[0]["result"];
                if(values[0]["result"] === true){
                    opObj.message = "儲存成功";
                    // 更新資料
                    fetchRestaurant();
                }else{
                    opObj.message = values[0]["message"];
                }
                document.getElementById("alertMsg").classList.remove("hidden");

                setTimeout(() => {
                    document.getElementById("alertMsg").classList.add("hidden");
                }, 3000);

            });

        }, 500);
    }
    // 藉由 google map 依地址取得經緯度
    function geocodeAddress(address) {
        let geoPromise = new Promise((resolve, reject) => {
            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': address}, function(results, status) {
                if (status === 'OK') {

                    resolve({
                        latitude: results[0].geometry.location.lat(),
                        longitude: results[0].geometry.location.lng(),
                    });
                } else {
                    opObj.status = false;
                    opObj.message = 'Geocode was not successful for the following reason: ' + status;

                    document.getElementById("alertMsg").classList.remove("hidden");

                    reject(opObj.message);
                }
            });
        });
        return geoPromise;
    }
    // 取得使用者個人資料
    function fetchUser(){
        let fetchUserPromise = fetchData({
            api: "get_user",
            data: {
                account: props.account,
            }
        });
        Promise.all([fetchUserPromise]).then((values) => {
            console.log("fetchUserPromise.values=", values);

            userObj["account"] = props.account;
            if(values.length > 0){
                userObj["name"] = values[0].name;
                userObj["mail"] = values[0].mail;
                userObj["app_title"] = values[0].app_title;
                userObj["language"] = values[0].language;
                userObj["role"] = values[0].role;

                languageRadioParam["selectedOption"] = values[0].language;
            }
        });
    }
    // 儲存個人資料
    function saveUser(){
        console.log("saveUser.userObj=", userObj);
        console.log("saveUser.languageRadioParam=", languageRadioParam);

        let postData = [{
            account: userObj["account"],
            name: userObj["name"],
            mail: userObj["mail"],
            app_title: userObj["app_title"],
            language: languageRadioParam["selectedOption"],
            role: userObj["role"],
        }];

        let saveUserPromise = fetchData({
            api: "save_users",
            data: postData
        });
        Promise.all([saveUserPromise]).then((values) => {
            console.log("saveUserPromise.values=", values);

            opObj.status = values[0]["result"];
            if(values[0]["result"] === true){
                opObj.message = "儲存成功";
                // 更新資料
                fetchUser();
            }else{
                opObj.message = values[0]["message"];
            }
            document.getElementById("alertMsg").classList.remove("hidden");

            setTimeout(() => {
                document.getElementById("alertMsg").classList.add("hidden");
            }, 3000);

        });
    }
</script>

<template>

<div class="tabs tabs-border">

    <input v-if="appState === 'SET_PERSON'" type="radio" name="setting_tabs" class="tab" aria-label="設定 Finance" />
    <div v-if="appState === 'SET_PERSON'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Finance 資料
        </div>
        <div class="flex w-10/10 h-4/10 md:flex-row flex-col">
            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-md border p-2 m-2">
                <legend class="fieldset-legend text-lg">House</legend>

                <label class="label">目標</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.house.target" />
            </fieldset>

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-md border p-2 m-2">
                <legend class="fieldset-legend text-lg">信貸</legend>

                <label class="label">目標</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.credit.target" />

                <label class="label">剩餘</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.credit.remain" />

            </fieldset>

        </div>
        <div class="flex w-10/10 h-4/10 md:flex-row flex-col">
            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-md border p-2 m-2">
                <legend class="fieldset-legend text-lg">存款速度</legend>

                <label class="label">每期台幣存款( 每期為 3 個月 )</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_Speed.value1" />

                <label class="label">每期進帳股息( 每期為 3 個月 )</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_Speed.value2" />
            </fieldset>

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-md border p-2 m-2">
                <legend class="fieldset-legend text-lg">存款( TWD )</legend>

                <label class="label">價值</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_TWD.value" />
            </fieldset>

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-md border p-2 m-2">
                <legend class="fieldset-legend text-lg">存款( USD )</legend>

                <label class="label">價值</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_USD.value" />

                <label class="label">匯率</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_USD.currency" />
            </fieldset>
        </div>
        <div class="flex w-10/10 h-4/10 md:flex-row flex-col mt-1">
            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-lg border p-2 m-2">
                <legend class="fieldset-legend text-lg">0056.TW</legend>

                <div class="flex w-10/10 flex-col">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw0056.num" />

                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw0056.price" />
                </div>
            </fieldset>

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-lg border p-2 m-2">
                <legend class="fieldset-legend text-lg">00878.TW</legend>

                <div class="flex w-10/10 flex-col">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00878.num" />

                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00878.price" />
                </div>
            </fieldset>
        </div>
        <div class="flex w-10/10 h-4/10 md:flex-row flex-col mt-1">

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-lg border p-2 m-2">
                <legend class="fieldset-legend text-lg">00919.TW</legend>

                <div class="flex w-10/10 flex-col">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00919.num" />

                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00919.price" />
                </div>
            </fieldset>

            <fieldset class="fieldset bg-gray-300 border-gray-500 rounded-box w-lg border p-2 m-2">
                <legend class="fieldset-legend text-lg">nano.USD</legend>

                <div class="flex w-10/10 flex-col">
                    <label class="label">價值</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_nano.value" />

                    <label class="label">匯率</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_nano.currency" />
                </div>
            </fieldset>
        </div>
        <div class="w-10/10 h-1/10 flex flex-row-reverse mt-1">
            <button class="btn btn-neutral w-1/10 mx-1" @click="saveFinance">
                save
            </button>
        </div>
    </div>

    <input v-if="appState === 'SET_PERSON'" type="radio" name="setting_tabs" class="tab" aria-label="設定個人資料" />
    <div v-if="appState === 'SET_PERSON'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            個人資料
        </div>
        <div class="flex w-10/10 flex-col place-items-center">
            <div class="w-5/10">
                <label class="label mr-1">Name: </label><br />
                <input type="text" class="input" v-model="userObj.name" />
            </div>
            <div class="w-5/10 mt-5">
                <label class="label mr-1">Mail: </label><br />
                <input type="text" class="input" v-model="userObj.mail" />
            </div>
            <div class="w-5/10 mt-5">
                <label class="label mr-1">Language: </label><br />
                <label v-for="option in languageRadioParam.options" :key="option.value" class="mr-2">
                    <input type="radio" class="radio" :value="option.value" :name="languageRadioParam.radioGroupName" v-model="languageRadioParam.selectedOption">
                    {{ option.label }}
                </label>
            </div>
            <div class="w-5/10 mt-5">
                <label class="label mr-1">App Title: </label><br />
                <input type="text" class="input" v-model="userObj.app_title" />
            </div>
        </div>
        <div class="w-10/10 flex flex-row-reverse mt-1">
            <button class="btn btn-neutral w-1/10 mx-1" @click="saveUser">
                save
            </button>
        </div>
    </div>

    <input v-if="appState === 'SET_SYSTEM'" type="radio" name="setting_tabs" class="tab" aria-label="設定 Quiz 預設值" />
    <div v-if="appState === 'SET_SYSTEM'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Quiz 預設值
        </div>
        <div class="flex w-10/10 flex-col place-items-center">
            <div class="w-5/10">
                <label class="label mr-1">題數: </label>
                <input type="number" min="0" class="input" placeholder="0" v-model="quiz_setting.count" />
            </div>
            <div class="w-5/10 mt-5">
                <label class="label mr-1">最大的數字: </label>
                <input type="number" min="0" class="input" placeholder="0" v-model="quiz_setting.max_number" />
            </div>
        </div>
        <div class="w-10/10 flex flex-row-reverse mt-1">
            <button class="btn btn-neutral w-1/10 mx-1" @click="saveQuiz">
                save
            </button>
        </div>
    </div>

    <input v-if="appState === 'SET_SYSTEM'" type="radio" name="setting_tabs" class="tab" aria-label="設定餐廳清單" />
    <div v-if="appState === 'SET_SYSTEM'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Restaurant 資料
        </div>
        <div class="flex w-10/10 flex-col">
            <fieldset v-for="(restObj, rest_i) in restaurants" class="fieldset bg-gray-300 border-gray-500 rounded-box border p-2 my-2 w-10/10">
                <label class="label">{{ restObj.name }} ( {{ restObj.latitude }}, {{ restObj.longitude }} )</label>
                <div class="join">
                    <input type="text" class="input join-item w-5/10" placeholder="店名" v-model="restObj.edit_name" />
                    <input type="text" class="input join-item w-5/10" placeholder="地址" v-model="restObj.edit_address" />
                </div>
            </fieldset>
        </div>
        <div class="w-10/10 flex flex-row-reverse mt-1">
            <button class="btn btn-neutral w-1/10 mx-1" @click="newRestaurant">
                new
            </button>
            <button class="btn btn-neutral w-1/10 mx-1" @click="saveRestaurant">
                save
            </button>
        </div>
    </div>
</div>

<div id="alertMsg" class="toast hidden w-5/10">
    <div class="alert w-10/10" :class="{ 'alert-success': opObj.status == true, 'alert-error': opObj.status == false }">
        <span>{{ opObj.message }}</span>
    </div>
</div>

</template>

<style scoped>

</style>
