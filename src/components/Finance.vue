<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { fetchData } from "@/composables/fetchData"

    const props = defineProps({
        title: String,
        account: String
    })

    onMounted(() => {
        console.log("Finance mounted.");
        init();
    });

    let appState = ref("");
    let progressSetting = reactive({
        house: {
            value: null,
            max: null,
            targetText: "",
            progressText: "",
        },
        credit: {
            value: null,
            max: null,
            targetText: "",
            progressText: "",
            remainText: "",
            remainValue: null,
        },
        speed: {
            target: 0,
            speed: 0,
            perMonth: 0,
        },
    });
    let deposit_TWD = ref(0);
    let deposit_USD = ref(0);
    let deposit_LikeTWD = ref(0);
    let stock_USD = ref(0);
    let stock_LikeTWD = ref(0);

    let stockTW = reactive({
        totalValue: "",
        totalTWD: "",
        tw0056: "",
        tw0056_TWD: "",
        tw00878: "",
        tw00878_TWD: "",
        tw00919: "",
        tw00919_TWD: "",
    });

    // 初始化 component
    function init(){
        console.log("finance.init");
        console.log("props.account=" + props.account);

        if(props.account){
            // 取得使用者個人 finance 資料
            fetchFinance();
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

            let stockDatas_TWD = [];
            let stockData_USD = null;
            let houseObj = null;
            let creditObj = null;
            let depositObj_TWD = null;
            let depositObj_USD = null;
            let depositObj_Speed = null;
            values[0].forEach((finObj, fin_i) => {
                if(finObj["name"] === "house"){
                    // 購屋資訊
                    houseObj = finObj;
                } else if(finObj["name"] === "credit"){
                    // 信貸資訊
                    creditObj = finObj;
                } else if(finObj["name"].indexOf("stock_") >= 0 && finObj["name"] !== "stock_nano"){
                    // 台股資訊
                    stockDatas_TWD.push( finObj  );
                } else if(finObj["name"] === "stock_nano"){
                    // 奈米投資訊
                    stockData_USD = finObj;
                } else if(finObj["name"] === "deposit" && finObj["currency"] === "TWD"){
                    // 台幣存款資訊
                    depositObj_TWD = finObj;
                } else if(finObj["name"] === "deposit" && finObj["currency"] === "USD"){
                    // 美金存款資訊
                    depositObj_USD = finObj;
                } else if(finObj["name"] === "speed"){
                    // 存款速度資訊
                    depositObj_Speed = finObj;
                }
            });
            buildStockTW(stockDatas_TWD);
            buildStockGlobal(stockData_USD);
            buildDepositTWD(depositObj_TWD);
            buildDepositUSD(depositObj_USD);
            buildCreditBlock(creditObj, depositObj_TWD);
            buildHouseBlock(houseObj, depositObj_USD,  stockData_USD);
            buildSpeedBlock(depositObj_Speed);
        });
    }
    // 建立"購屋進度"區塊
    function buildHouseBlock(houseObj, depositObj_USD, stockData_USD){
        let targetValue = houseObj["value1"];
        let currentValue = depositObj_USD["value1"] * depositObj_USD["value2"] + stockData_USD["value1"] * stockData_USD["value2"];

        progressSetting.house.max = 100;
        progressSetting.house.value = Math.floor( currentValue * 100 / (targetValue * 0.3) );

        progressSetting.house.targetText = "目標: " + (new Intl.NumberFormat().format(targetValue));
        progressSetting.house.progressText = "";
        progressSetting.house.progressText += "進度: ";
        progressSetting.house.progressText += (new Intl.NumberFormat().format(currentValue)) + " / ";
        progressSetting.house.progressText += (new Intl.NumberFormat().format(targetValue * 0.3)) + "( 粗估三成 )";
        progressSetting.house.progressText += " = " + progressSetting.house.value + "%";
    }
    // 建立"還款進度"區塊
    function buildCreditBlock(creditObj, depositObj_TWD){
        let targetValue = creditObj["value1"];
        let currentValue = creditObj["value2"];
        let depositValue = depositObj_TWD["value1"];

        progressSetting.credit.max = 100;
        progressSetting.credit.value = Math.floor( (targetValue - currentValue) * 100 / targetValue );

        progressSetting.credit.targetText = "目標: " + (new Intl.NumberFormat().format(targetValue));
        progressSetting.credit.progressText = "";
        progressSetting.credit.progressText += "進度: ";
        progressSetting.credit.progressText += (new Intl.NumberFormat().format(targetValue - currentValue)) + " / ";
        progressSetting.credit.progressText += (new Intl.NumberFormat().format(targetValue));
        progressSetting.credit.progressText += "=" + progressSetting.credit.value + "%";

        progressSetting.credit.remainValue = Math.floor((targetValue - (currentValue - depositValue))*100 / targetValue);
        progressSetting.credit.remainText = "";
        progressSetting.credit.remainText += "剩餘: " + (new Intl.NumberFormat().format(currentValue))
                                                + "-" + (new Intl.NumberFormat().format(depositValue))
                                                + "=" + (new Intl.NumberFormat().format(currentValue - depositValue)) + "";
        progressSetting.credit.remainText += "( " + progressSetting.credit.remainValue + "% )";
    }
    // 建立"存款速度"區塊
    function buildSpeedBlock(depositData){
        //console.log("buildSpeedBlock.depositData=", depositData);

        let targetValue = 100 * 10000; // 目標: 存到 100 萬台幣的速度
        let value1 = parseInt( depositData["value1"] ); // 每期可以存到的台幣( 每期是 3 個月 )
        let value2 = parseInt( depositData["value2"] ); // 每期可以存到的股息( 每期是 3 個月 )
        let valuePerMonth = ( value1 + value2 ) / 3; // 每個月共可存到的台幣

        let speed = Math.floor( targetValue / valuePerMonth );

        console.log("buildSpeedBlock.targetValue=" + targetValue);
        console.log("buildSpeedBlock.valuePerMonth=" + valuePerMonth);
        console.log("buildSpeedBlock.speed=" + speed);

        progressSetting["speed"]["target"] = Math.floor( targetValue / 10000 );
        progressSetting["speed"]["speed"] = Math.floor( speed );
        progressSetting["speed"]["perMonth"] = Math.floor( valuePerMonth );
    }
    // 建立"台灣股票"區塊
    function buildStockTW(stockDatas){
        console.log("buildStockTW.stockDatas=", stockDatas);

        let stockTotalValue = 0;
        let stockTotalTWD = 0;
        let stockLabels = [];
        let stockSeries = [];
        stockDatas.forEach((dataObj, d_i) => {
            let name = dataObj["name"];
            let stockLabel = name.split("_")[1];

            stockLabels.push( stockLabel );
            stockSeries.push( dataObj["value1"] );

            stockTotalValue += dataObj["value1"];
            stockTotalTWD += (dataObj["value1"] * dataObj["value2"]);
            switch(dataObj["name"]){
                case "stock_0056":
                    stockTW.tw0056 = new Intl.NumberFormat().format( dataObj["value1"] );
                    stockTW.tw0056_TWD = new Intl.NumberFormat().format( dataObj["value1"] * dataObj["value2"] );
                    break;
                case "stock_00878":
                    stockTW.tw00878 = new Intl.NumberFormat().format( dataObj["value1"] );
                    stockTW.tw00878_TWD = new Intl.NumberFormat().format( dataObj["value1"] * dataObj["value2"] );
                    break;
                case "stock_00919":
                    stockTW.tw00919 = new Intl.NumberFormat().format( dataObj["value1"] );
                    stockTW.tw00919_TWD = new Intl.NumberFormat().format( dataObj["value1"] * dataObj["value2"] );
                    break;
            }
        });
        stockTW.totalValue = new Intl.NumberFormat().format(stockTotalValue);
        stockTW.totalTWD = new Intl.NumberFormat().format(stockTotalTWD);
    }
    // 建立"全球股票"區塊
    function buildStockGlobal(stockData){
        console.log("buildStockGlobal.stockData=", stockData);

        stock_USD.value = new Intl.NumberFormat('en-US').format(stockData["value1"]);
        stock_LikeTWD.value = new Intl.NumberFormat('en-US').format(stockData["value1"] * stockData["value2"]);
    }
    // 建立"台幣存款"區塊
    function buildDepositTWD(depositData){
        console.log("buildDepositTWD.depositData=", depositData);

        deposit_TWD.value = new Intl.NumberFormat('en-US').format(depositData["value1"]);
    }
    // 建立"美金存款"區塊
    function buildDepositUSD(depositData){
        console.log("buildDepositUSD.depositData=", depositData);
        deposit_USD.value = new Intl.NumberFormat('en-US').format(depositData["value1"]);
        deposit_LikeTWD.value = new Intl.NumberFormat('en-US').format(depositData["value1"] * depositData["value2"]);
    }


</script>

<template>

<div class="flex flex-col w-10/10 h-10/10">

    <div class="flex flex-col w-10/10">
        <div class="flex flex-row w-10/10 h-10/10 gap-2">
            <div class="card rounded-box grid h-10/10 w-5/10 p-5 place-items-center"
                 :class="{'bg-red-300': 36 <= progressSetting.speed.speed,
                          'bg-orange-300': 20 <= progressSetting.speed.speed && progressSetting.speed.speed < 36,
                          'bg-blue-300': 10 < progressSetting.speed.speed && progressSetting.speed.speed < 20,
                          'bg-green-300': progressSetting.speed.speed <= 10}">
                <div class="w-10/10 text-3xl text-center">
                    {{ progressSetting["speed"]["speed"] }}
                    <span class="text-sm">個月</span>
                    <br />
                    <span class="text-sm">
                       ( 存到 {{ progressSetting["speed"]["target"] }} 萬 )
                    </span>
                </div>
            </div>
            <div class="card rounded-box grid h-10/10 w-5/10 p-5 place-items-center"
                 :class="{'bg-red-300': 36 <= progressSetting.speed.speed,
                          'bg-orange-300': 20 <= progressSetting.speed.speed && progressSetting.speed.speed < 36,
                          'bg-blue-300': 10 < progressSetting.speed.speed && progressSetting.speed.speed < 20,
                          'bg-green-300': progressSetting.speed.speed <= 10}">
                <div class="w-10/10 text-3xl text-center">
                    {{ progressSetting["speed"]["perMonth"] }}
                    <span class="text-sm">/月</span>
                </div>
            </div>
        </div>
        <div class="divider"></div>
        <div class="flex flex-col md:flex-row w-10/10 h-10/10 gap-2">
            <div class="card bg-base-300 rounded-box grid p-5 h-10/10 w-10/10 md:w-5/10 place-items-center">
                <div class="w-10/10 text-xl">總股數: {{ stockTW.totalValue }}</div>
                <div class="w-10/10 text-lg">台股總市值 TWD: {{ stockTW.totalTWD }}</div>
            </div>
            <div class="divider md:divider-horizontal"></div>
            <div class="card bg-gray-300 rounded-box grid p-5 h-10/10 w-10/10 md:w-5/10 place-items-start">
                <span>0056.TW </span> 
                <span>股數: {{ stockTW.tw0056 }} / TWD: {{ stockTW.tw0056_TWD }}</span>
                <div class="divider"></div>
                <span>00878.TW </span>
                <span>股數: {{ stockTW.tw00878 }} / TWD: {{ stockTW.tw00878_TWD }}</span>
                <div class="divider"></div>            
                <span>00919.TW </span>
                <span>股數: {{ stockTW.tw00919 }} / TWD: {{ stockTW.tw00919_TWD }}</span>
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <div class="card bg-base-300 rounded-box grid h-3/10 w-10/10 p-5 place-items-center">
        <div class="w-10/10 text-2xl">存款 TWD: {{ deposit_TWD }}</div>
    </div>

    <div class="divider"></div>

    <div class="card bg-base-300 rounded-box grid h-10/10 w-10/10 p-5 place-items-center">
        <div class="flex flex-col w-10/10">
            <span>{{ progressSetting.credit.targetText }}</span>
            <span>{{ progressSetting.credit.progressText }}</span>
        </div>
        <progress class="w-10/10 progress"
                :class="{ 'progress-error': progressSetting.credit.value && progressSetting.credit.value < 50,
                            'progress-warning': progressSetting.credit.value && 50 <= progressSetting.credit.value && progressSetting.credit.value < 80,
                            'progress-info': progressSetting.credit.value && 80 <= progressSetting.credit.value && progressSetting.credit.value < 90,
                            'progress-success': progressSetting.credit.value && 90 <= progressSetting.credit.value }"
                :value="progressSetting.credit.value" :max="progressSetting.credit.max">
        </progress>
        <div class="flex flex-col w-10/10">
            <span>{{ progressSetting.credit.remainText }}</span>
        </div>
        <progress class="w-10/10 progress"
                :class="{ 'progress-error': progressSetting.credit.remainValue && progressSetting.credit.remainValue < 50,
                            'progress-warning': progressSetting.credit.remainValue && 50 <= progressSetting.credit.remainValue && progressSetting.credit.remainValue < 80,
                            'progress-info': progressSetting.credit.remainValue && 80 <= progressSetting.credit.remainValue && progressSetting.credit.remainValue < 90,
                            'progress-success': progressSetting.credit.remainValue && 90 <= progressSetting.credit.remainValue }"
                :value="progressSetting.credit.remainValue" :max="progressSetting.credit.max">
        </progress>
    </div>

    <div class="divider"></div>

    <div class="card bg-base-300 rounded-box grid h-10/10 w-10/10 p-5 place-items-center">
        <div class="flex flex-col w-10/10">
            <span>{{ progressSetting.house.targetText }}</span>
            <span>{{ progressSetting.house.progressText }}</span>
        </div>
        <progress class="w-10/10 progress"
                :class="{ 'progress-error': progressSetting.house.value && progressSetting.house.value < 50,
                            'progress-warning': progressSetting.house.value && 50 <= progressSetting.house.value && progressSetting.house.value < 80,
                            'progress-info': progressSetting.house.value && 80 <= progressSetting.house.value && progressSetting.house.value < 90,
                            'progress-success': progressSetting.house.value && 90 <= progressSetting.house.value }"
                :value="progressSetting.house.value" :max="progressSetting.house.max">
        </progress>
    </div>

    <div class="divider"></div>
    
    <div class="flex flex-col md:flex-row w-10/10 h-10/10 gap-2">
        <div class="card bg-base-300 rounded-box grid h-10/10 w-10/10 md:w-5/10 p-5 place-items-center">
            <div class="w-10/10 text-2xl">存款 USD: {{ deposit_USD }}</div>
            <div class="w-10/10 text-lg">約當 TWD( 1:30 ): {{ deposit_LikeTWD }}</div>
        </div>

        <div class="divider"></div>

        <div class="card bg-base-300 rounded-box grid h-10/10 w-10/10 md:w-5/10 p-5 place-items-center">
            <div class="w-10/10 text-2xl">奈米投 USD: {{ stock_USD }}</div>
            <div class="w-10/10 text-lg">約當 TWD( 1:30 ): {{ stock_LikeTWD }}</div>
        </div>
    </div>

    <div class="divider"></div>
</div>

</template>

<style scoped>

</style>
