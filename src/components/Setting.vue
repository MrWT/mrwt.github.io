<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { fetchData } from "@/composables/fetchData"

    const emit = defineEmits(['popupMessage']);
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
    let awards = reactive([]);
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
            fetchAward();
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
        console.log("saveFinance.finance=", finance);

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

            emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data
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
            emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data
        });
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
                    emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data

                    reject(opObj.message);
                }
            });
        });
        return geoPromise;
    }
    // 取得 award 資料
    function fetchAward(){
        let fetchAwardPromise = fetchData({
            api: "get_awards",
            data: {
                check_receive_count: "false",
            },
        });
        Promise.all([fetchAwardPromise]).then((values) => {
            console.log("fetchAwardPromise.values=", values);

            // 清空 awards
            awards.splice(0, awards.length);
            values[0].forEach((awardObj, award_i) => {
                awards.push({
                    op: "EDIT",
                    name: awardObj["name"],
                    display_text: awardObj["display_text"],
                    count: awardObj["count"],
                    pickup_percent: awardObj["pickup_percent"],
                    receive_count: awardObj["receive_count"],
                });
            });
            console.log("awards", awards);
        });
    }
    // 新增 award 設定資料
    function newAward(){
        //console.log("newAward");
        const guid = crypto.randomUUID();

        awards.push({
            op: "NEW",
            name: guid,
            display_text: "",
            count: 0,
            pickup_percent: 0,
            receive_count: 0,
        });
    }
    // 儲存 award 設定資料
    function saveAward(){
        console.log("saveAward.awards=", awards);

        let saveAwardsPromise = fetchData({
            api: "edit_awards",
            data: awards
        });
        Promise.all([saveAwardsPromise]).then((values) => {
            console.log("saveAwardsPromise.values=", values);

            opObj.status = values[0]["result"];
            if(values[0]["result"] === true){
                opObj.message = "儲存成功";
                // 更新資料
                fetchAward();
            }else{
                opObj.message = values[0]["message"];
            }
            emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data
        });
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
            emit('popupMessage', opObj.status, opObj.message); // Emitting the event with data
        });
    }
</script>

<template>

<div class="tabs tabs-border">
    <!-- Finance -->
    <input v-if="appState === 'SET_PERSON'" type="radio" name="setting_tabs" class="tab" aria-label="設定 Finance" />
    <div v-if="appState === 'SET_PERSON'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Finance 資料
        </div>
        <div class="w-10/10 flex flex-col">
            <div class="divider divider-warning">
                買房
            </div>
            <div class="w-10/10 md:w-5/10">
                <label class="label">目標房價</label>
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.house.target" />
            </div>

            <div class="divider divider-error">
                信貸
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">目標</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.credit.target" />
                </div>
                <div class="w-5/10">
                    <label class="label">剩餘</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.credit.remain" />
                </div>
            </div>

            <div class="divider divider-success">存款</div>
            <div class="divider divider-success">
                存款速度( 以 3 個月為一期 )
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">台幣/期</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_Speed.value1" />
                </div>
                <div class="w-5/10">
                    <label class="label">股息/期</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_Speed.value2" />
                </div>
            </div>

            <div class="divider divider-success">
                存款( TWD )
            </div>
            <div class="w-10/10 md:w-5/10 flex flex-row">
                <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_TWD.value" />
            </div>

            <div class="divider divider-success">
                存款( USD )
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">價值</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_USD.value" />
                </div>
                <div class="w-5/10">
                    <label class="label">匯率</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.deposit_USD.currency" />
                </div>
            </div>

            <div class="divider divider-neutral">
                存股
            </div>
            <div class="divider divider-neutral">
                0056.TW
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw0056.num" />
                </div>
                <div class="w-5/10">
                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw0056.price" />
                </div>
            </div>

            <div class="divider divider-neutral">
                00878.TW
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00878.num" />
                </div>
                <div class="w-5/10">
                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00878.price" />
                </div>
            </div>

            <div class="divider divider-neutral">
                00919.TW
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">股數</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00919.num" />
                </div>
                <div class="w-5/10">
                    <label class="label">單價</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_tw00919.price" />
                </div>
            </div>

            <div class="divider">
                奈米投
            </div>
            <div class="w-10/10 md:w-8/10 flex flex-row">
                <div class="w-5/10">
                    <label class="label">USD</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_nano.value" />
                </div>
                <div class="w-5/10">
                    <label class="label">匯率</label>
                    <input type="number" min="0" class="input" placeholder="0" v-model="finance.stock_nano.currency" />
                </div>
            </div>
        </div>
        <div class="w-10/10 flex flex-col md:flex-row-reverse mt-5 justify-center">
            <button class="btn btn-neutral w-10/10 md:w-5/10" @click="saveFinance">
                save
            </button>
        </div>
    </div>

    <!-- 個人資料 -->
    <input v-if="appState === 'SET_PERSON'" type="radio" name="setting_tabs" class="tab" aria-label="設定個人資料" />
    <div v-if="appState === 'SET_PERSON'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            個人資料
        </div>
        <div class="flex w-10/10 flex-col place-items-center gap-5">
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">Name: </label><br />
                <input type="text" class="input" v-model="userObj.name" />
            </div>
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">Mail: </label><br />
                <input type="text" class="input" v-model="userObj.mail" />
            </div>
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">Language: </label><br />
                <label v-for="option in languageRadioParam.options" :key="option.value" class="mr-2">
                    <input type="radio" class="radio" :value="option.value" :name="languageRadioParam.radioGroupName" v-model="languageRadioParam.selectedOption">
                    {{ option.label }}
                </label>
            </div>
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">App Title: </label><br />
                <input type="text" class="input" v-model="userObj.app_title" />
            </div>
        </div>
        <div class="w-10/10 flex flex-col md:flex-row-reverse mt-5 justify-center">
            <button class="btn btn-neutral w-10/10 md:w-5/10" @click="saveUser">
                save
            </button>
        </div>
    </div>

    <!-- Quiz 預設值 -->
    <input v-if="appState === 'SET_SYSTEM'" type="radio" name="setting_tabs" class="tab" aria-label="設定 Quiz 預設值" />
    <div v-if="appState === 'SET_SYSTEM'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Quiz 預設值
        </div>
        <div class="flex w-10/10 flex-col gap-5 place-items-center">
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">題數: </label>
                <input type="number" min="0" class="input" placeholder="0" v-model="quiz_setting.count" />
            </div>
            <div class="w-10/10 md:w-5/10">
                <label class="label mr-1">最大的數字: </label>
                <input type="number" min="0" class="input" placeholder="0" v-model="quiz_setting.max_number" />
            </div>
        </div>
        <div class="w-10/10 flex flex-col md:flex-row-reverse mt-1 justify-center">
            <button class="btn btn-neutral w-10/10 md:w-5/10 mx-1" @click="saveQuiz">
                save
            </button>
        </div>
    </div>

    <!-- Award -->
    <input v-if="appState === 'SET_SYSTEM'" type="radio" name="setting_tabs" class="tab" aria-label="設定獎項清單" />
    <div v-if="appState === 'SET_SYSTEM'" class="tab-content border-base-300 bg-base-100 pt-1 px-5">
        <div class="divider">
            Award 資料
        </div>
        <div class="flex w-10/10 flex-col gap-2">
            <fieldset v-for="(awardObj, award_i) in awards" class="fieldset bg-gray-300 border-gray-500 rounded-box border p-2 w-10/10">
                <div class="flex flex-col join-item w-10/10">
                    <label class="label">名稱</label>
                    <input type="text" class="input w-10/10" placeholder="名稱" v-model="awardObj.display_text" />
                </div>
                <div class="join">
                    <div class="flex flex-col join-item w-5/10">
                        <label class="label">總量</label>
                        <input type="number" class="input w-10/10" placeholder="總量" v-model="awardObj.count" />
                    </div>
                    <div class="flex flex-col join-item w-5/10">
                        <label class="label">已領量</label>
                        <input type="number" class="input w-10/10" placeholder="已領量" v-model="awardObj.receive_count" />
                    </div>
                </div>
                <div class="flex flex-col w-10/10">
                    <label class="label">(相對)出現機率: {{ awardObj.pickup_percent }}%</label>
                    <input type="range" min="0" max="100" v-model="awardObj.pickup_percent" class="range range-info w-10/10" />
                </div>
            </fieldset>
        </div>
        <div class="w-10/10 flex flex-col md:flex-row-reverse mt-2 gap-2 justify-center">
            <button class="btn btn-neutral w-10/10 md:w-5/10" @click="newAward">
                new
            </button>
            <button class="btn btn-neutral w-10/10 md:w-5/10" @click="saveAward">
                save
            </button>
        </div>
    </div>
</div>

</template>

<style scoped>

</style>
