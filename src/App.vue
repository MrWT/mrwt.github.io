<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import Finance from './components/Finance.vue'
    import Gallery from './components/Gallery.vue'
    import Restaurant from './components/Restaurant.vue'
    import Quiz from './components/Quiz.vue'
    import Readme from './components/Readme.vue'
    import Setting from './components/Setting.vue'
    import Chat from './components/Chat.vue'

    onMounted(() => {
        console.log("App mounted.");
        init();

        // 沒有使用者資訊時, 跳出 signinModal
        if(!userInfo.account){
            document.getElementById("signinModal").showModal();
            setTimeout(() => {
                document.getElementById("signinName").focus();
            }, 400);

        }
    });

    // 系統資訊
    let appState = ref("SET_SYSTEM");
    let appSetting = reactive({
        state: "",
        contentComponent: "gallery",
        title: "V.Demo",
        resources: [],
        quiz: {},
    });
    // 使用者資訊
    let signinError = ref(false);
    const tempAccount = ref("");
    const userInfo = reactive({
        account: null,
        name: null,
        shortName: null,
        mail: null,
        role: null,
        funcs: [],
        languages: {},
    });

    // 初始化 app
    function init(){

    }
    // 重設系統設定
    function resetAppSetting(){
        appSetting.contentComponent = "gallery";
        appSetting.title = "V.Demo";
    }
    // 置換 component
    function gotoPage(page) {
        appSetting.contentComponent = "reset";

        if(page === "set_person"){
            appState.value = "SET_PERSON";
            page = "setting";
        }else if(page === "set_system"){
            appState.value = "SET_SYSTEM";
            page = "setting";
        }
        setTimeout(() => {
            appSetting.contentComponent = page;
        }, 200);
    }
    // keyin account
    function keyinAccount(event){
        tempAccount.value = event.target.value.toUpperCase();
    }
    // 重設使用者資訊
    function resetUserInfo(){
        tempAccount.value = "";
        userInfo.account = null;
        userInfo.name = null;
        userInfo.shortName = null;
        userInfo.mail = null;
        userInfo.role = null;
        userInfo.funcs = [];
        userInfo.languages = {};
    }
    // 登入
    function signin(){
        //console.log("signin.click");
        //console.log("tempAccount.value=", tempAccount.value);

        if(tempAccount.value){
            // 開啟"系統處理中 mask"
            $("#loading").show();

            // close signinModal
            document.getElementById("signinModal").close();

            let fetchAppSetting = fetchData({
                api: "get_app_setting",
            });

            let fetchUserData = fetchData({
                api: "login",
                data: {
                    account: tempAccount.value.trim()
                }
            });

            let fetchUserLanguage = fetchData({
                api: "get_language",
                data: {
                    account: tempAccount.value
                }
            });

            Promise.all([fetchAppSetting, fetchUserData, fetchUserLanguage]).then((values) => {
                console.log("signin.values=", values);

                if(!values || !values[1]){
                    signinError.value = true;
                    signout();
                    return;
                }
                signinError.value = false;

                let appSettingObj = values[0];
                console.log("appSettingObj=", appSettingObj);
                // appSetting.resources
                {
                    appSetting.resources = [];
                    appSettingObj["resource"].sort((x, y) => {
                        return x["seq"] - y["seq"];
                    });
                    appSettingObj["resource"].forEach((appSetObj, as_i) => {
                        appSetting.resources.push({
                            index: ((as_i + 1) < 10 ? "0" : "") + (as_i + 1),
                            name: appSetObj["key"],
                            text: appSetObj["value1"],
                            link: appSetObj["value2"],
                        });
                    });
                }

                // 動態載入 Google Maps API
                let hasImportGoogleMapLibrary = false;
                {
                    let scripts = document.getElementsByTagName('script');
                    for(let s_i = 0; s_i < scripts.length; s_i++){
                        if(scripts[s_i].src.indexOf("maps.googleapis.com/maps/api/js?key=") >= 0){
                            hasImportGoogleMapLibrary = true;
                            break;
                        }
                    }
                }
                if(!hasImportGoogleMapLibrary){
                    let google_map_api_src = "https://maps.googleapis.com/maps/api/js?key=" + appSettingObj["google_map_key"]; // + "&libraries=marker";
                    const script = document.createElement('script');
                    script.src = google_map_api_src;
                    script.defer = true;
                    script.async = true;
                    script.onload = () => { /* 成功載入回調 */ };
                    document.body.appendChild(script);
                }

                // appSetting.quiz
                appSetting.quiz = {
                    count: appSettingObj["quiz_count"],
                    max_number: appSettingObj["quiz_max_number"],
                };



                // user info
                {
                    let userInfoObj = values[1];
                    console.log("userInfoObj=", userInfoObj);
                    userInfo.account = userInfoObj["account"];
                    userInfo.name = userInfoObj["name"];
                    userInfo.shortName = userInfo.name.substr(0, 1);
                    userInfo.mail = userInfoObj["mail"];
                    userInfo.role = userInfoObj["role"];
                    userInfo.funcs = userInfoObj["function"];
                    appSetting.title = userInfoObj["app_title"];
                }

                // user language
                {
                    let userLangObj = values[2];
                    console.log("userLangObj=", userLangObj);
                    userInfo.languages = {};
                    userLangObj["words"].forEach((word, w_i) => {
                        let w_key = word["name"];
                        let w_display = word["display_text"];

                        userInfo.languages[w_key] = w_display;
                    });
                }

                // close signinModal
                document.getElementById("signinModal").close();

                // 關閉"系統處理中 mask"
                $("#loading").hide();
            });
        }
    }
    // 登出
    function signout(){
        resetUserInfo();
        resetAppSetting();
        document.getElementById("signinModal").showModal();
        setTimeout(() => {
            document.getElementById("signinName").focus();
        }, 400);
    }
    // 進入全螢幕模式
    function launchIntoFullscreen() {
        let ele = document.documentElement;

        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.mozRequestFullScreen) { /* Firefox */
            ele.mozRequestFullScreen();
        } else if (ele.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            ele.webkitRequestFullscreen();
        } else if (ele.msRequestFullscreen) { /* IE/Edge */
            ele.msRequestFullscreen();
        }
    }
</script>

<template>
    <!-- 系統 loading mask -->
    <div id="loading" class="w-full h-full flex justify-center items-center bg-gray-700/70 absolute top-0 left-0 z-999" style="display:none;">
        <span class="loading loading-spinner text-white loading-xl"></span>
        <span class="sr-only">Loading...</span>
    </div>

    <div class="navbar bg-slate-200/100 shadow-lg h-1/10 fixed top-0 left-0 z-50">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                </div>
                <ul tabindex="0" class="menu menu-lg dropdown-content bg-gray-800/80 rounded-box z-1 mt-3 w-65 p-2 shadow">
                    <li v-if="userInfo.funcs.indexOf('gallery') !== -1" class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown"><a @click="gotoPage('gallery')">> {{ userInfo.languages["gallery"] }}</a></li>
                    <li v-if="userInfo.funcs.indexOf('quiz') !== -1" class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown"><a @click="gotoPage('quiz')">> {{ userInfo.languages["quiz"] }}</a></li>
                    <li v-if="userInfo.funcs.indexOf('restaurant') !== -1" class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown"><a @click="gotoPage('restaurant')">> {{ userInfo.languages["restaurant"] }}</a></li>
                    <li v-if="userInfo.funcs.indexOf('finance') !== -1" class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown"><a @click="gotoPage('finance')">> {{ userInfo.languages["finance"] }}</a></li>
                    <li v-if="userInfo.funcs.indexOf('chat') !== -1" class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown"><a @click="gotoPage('chat')">> {{ userInfo.languages["chat"] }}</a></li>

                    <li v-if="userInfo.funcs.indexOf('laboratory') !== -1" class="text-white hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown group">
                        <div class="dropdown dropdown-right dropdown-start">
                            <div tabindex="0" role="button" class="w-40  group-hover:text-black group-hover:rounded-lg">
                                > K49 實驗室 >
                            </div>
                            <ul tabindex="0" class="menu menu-lg dropdown-content bg-gray-800/80 rounded-box z-1 mt-3 w-60 p-2 shadow">
                                <li class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown">
                                    <a>> 實驗1</a>
                                </li>
                                <li class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown">
                                    <a>> 實驗2</a>
                                </li>
                                <li class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown">
                                    <a>> 實驗3</a>
                                </li>
                                <li class="text-white  hover:bg-gray-100/100 hover:text-black hover:rounded-lg menu-dropdown">
                                    <a>> 實驗4</a>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="navbar-center">
            <a class="btn btn-ghost text-xl" @click="gotoPage('readme')">
                <span>{{ appSetting.title }}</span>
            </a>
        </div>
        <div class="navbar-end">
            <button v-if="userInfo.funcs.indexOf('fullscreen') !== -1" class="btn btn-ghost btn-circle" title="全螢幕" @click="launchIntoFullscreen">
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
                </svg>
            </button>
            <button v-if="userInfo.funcs.indexOf('search') !== -1" class="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
            </button>
            <button v-if="userInfo.funcs.indexOf('notify') !== -1" class="btn btn-ghost btn-circle">
                <div class="indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                    <span class="badge badge-xs badge-primary indicator-item"></span>
                </div>
            </button>
            <button v-if="userInfo.funcs.indexOf('setting') !== -1" class="btn btn-ghost btn-circle" @click="gotoPage('set_system')">
                <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                </svg>
            </button>
            <div v-if="userInfo.funcs.indexOf('userInfo') !== -1" class="dropdown dropdown-end">
                <button class="btn btn-ghost btn-circle">
                    <div class="avatar avatar-placeholder">
                        <div class="bg-gray-900/100 text-white size-8 rounded-full"
                                :class="{'bg-lime-900/100': userInfo.role === 'admin', 'bg-yellow-900/100': userInfo.role === 'tn100'}">
                            <span class="text-xs">{{ userInfo.shortName }}</span>
                        </div>
                    </div>
                </button>
                <ul tabindex="0" class="dropdown-content bg-gray-800/80 rounded-box z-1 mt-3 w-120 p-2 shadow">
                    <li class="text-white text-lg">{{ userInfo.name }}</li>
                    <li v-if="userInfo.mail" class="text-white text-lg">{{ userInfo.mail }}</li>
                    <div class="divider"></div>
                    <li class="flex flex-row w-10/10">
                        <button v-if="userInfo.account" class="btn w-5/10 mr-1" @click="gotoPage('set_person')">
                            <svg class="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                            </svg>
                            Setting
                        </button>
                        <button class="btn w-5/10" @click="signout">
                            <span v-if="userInfo.account">
                                {{ userInfo.languages["signout"] }}
                            </span>
                            <svg v-if="userInfo.account" class="w-6 h-6 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
                            </svg>

                            <svg v-if="!userInfo.account" class="w-6 h-6 text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                            </svg>
                            <span v-if="!userInfo.account">
                                {{ userInfo.languages["signin"] }}
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="p-4 h-9/10 mt-15">
        <Gallery v-if="appSetting.contentComponent === 'gallery'" :title="appSetting.title" />
        <Quiz v-else-if="appSetting.contentComponent === 'quiz'" :title="appSetting.title" :setting="appSetting.quiz" />
        <Readme v-else-if="appSetting.contentComponent === 'readme'" :title="appSetting.title" :resources="appSetting.resources" />
        <Restaurant v-else-if="appSetting.contentComponent === 'restaurant'" :title="appSetting.title" :account="userInfo.account" />
        <Finance v-else-if="appSetting.contentComponent === 'finance'" :title="appSetting.title" :account="userInfo.account" />
        <Setting v-else-if="appSetting.contentComponent === 'setting'" :title="appSetting.title" :account="userInfo.account" :quiz_setting="appSetting.quiz" :app_state="appState" />
        <Chat v-else-if="appSetting.contentComponent === 'chat'" :title="appSetting.title" :account="userInfo.account" />
    </div>

    <!-- signin modal -->
    <dialog id="signinModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold text-center">Hello!</h3>
            <h4 v-if="signinError" class="text-red-900 text-center mb-5">Error! 登入失敗~ 請檢查登入帳號!</h4>
            <div class="flex justify-center items-center join">
                <input id="signinName" type="text" placeholder="What's your name?" class="input input-ghost join-item" :value="tempAccount" @change="keyinAccount" @keyup.enter="signin" autofocus />
                <button class="btn btn-primary join-item ml-1" @click="signin" >
                    <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                    </svg>
                </button>
            </div>
        </div>
    </dialog>


</template>

<style scoped>


</style>
