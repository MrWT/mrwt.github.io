<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { gsap } from "gsap"
    import { fetchData } from "./composables/fetchData"
    import { getRandomNumber } from "./composables/random"

    import Finance from './components/Finance.vue'
    import Gallery from './components/Gallery.vue'
    import Footmark from './components/Footmark.vue'
    import Quiz from './components/Quiz.vue'
    import Readme from './components/Readme.vue'
    import Setting from './components/Setting.vue'
    import Chat from './components/Chat.vue'
    import Author from './components/Author.vue'
    import LockLucky from './components/LockLucky.vue'
    import PopupMessage from './components/PopupMessage.vue'

    onMounted(() => {
        console.log("App mounted.");
        init();

        // 沒有使用者資訊時, 跳出 signinModal
        if(!userInfo.account){
            document.getElementById("signinModal").showModal();
            setTimeout(() => {
                document.getElementById("signinName").focus();

                genSigninAnimation_gsap();
            }, 400);

        }
    });

    // 系統資訊
    let appState = ref("SET_SYSTEM");
    let screenSize = ref("md");
    let switchMenu = ref(true);
    let appSetting = reactive({
        state: "",
        contentComponent: "gallery",
        title: "V.Demo",
        googleMapApiKey: "",
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
    let opObj = reactive({
        status: false,
        message: "",
    });

    // 初始化 app
    function init(){
        // w-sm 約等於 384px
        // w-md 約等於 448px
        if(window.innerWidth > 448){
            screenSize.value = "md";
            switchMenu.value = true;
        }else if(304 < window.innerWidth && window.innerWidth < 448 ){
            screenSize.value = "sm";
            switchMenu.value = false;
        }else{
            screenSize.value = "xs";
            switchMenu.value = false;
        }
        console.log("window.innerWidth=" + window.innerWidth);
        console.log("screenSize.value=" + screenSize.value);
        console.log("switchMenu.value=" + switchMenu.value);
    }
    // 重設系統設定
    function resetAppSetting(){
        appSetting.contentComponent = "gallery";
        appSetting.title = "V.Demo";
    }
    // 置換 component
    function gotoPage(page) {
        // close userInfoModal
        document.getElementById("userInfoModal").close();
        switchMenu.value = false;

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

                // appSetting.googleMapApiKey
                appSetting.googleMapApiKey = appSettingObj["google_map_api_key"];

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
            });
        }
    }
    // 登出
    function signout(){
        // close userInfoModal
        document.getElementById("userInfoModal").close();
        switchMenu.value = false;

        resetUserInfo();
        resetAppSetting();
        document.getElementById("signinModal").showModal();
        setTimeout(() => {
            document.getElementById("signinName").focus();
        }, 400);
    }
    // 前往作者簡介
    function gotoIntroduceAuthor(data){
        console.log("gotoIntroduceAuthor.data=", data);
        gotoPage("author");
    }
    // 開關 menu
    function toggleMenu(){
        switchMenu.value = !switchMenu.value;
    }
    // 使用者資訊
    function openUserInfoModal(){
        document.getElementById("userInfoModal").showModal();
    }
    // 產生登入 modal 動畫
    function genSigninAnimation_gsap(){
        let signinModal = document.getElementById("signinModal");
        console.log("signinModal.clientHeight=", signinModal.clientHeight);
        console.log("signinModal.clientWidth=", signinModal.clientWidth);
        
        let tlList = [];
        for(let c_i = 0; c_i < 10; c_i++){
            let tl = gsap.timeline({ yoyo: true, repeat: -1 });
            tl.to("#circle" + c_i, {
                x: getRandomNumber(10, screenSize.value === "md" ? 300 : signinModal.clientWidth),
                y: getRandomNumber(10, screenSize.value === "md" ? 300 : signinModal.clientHeight),
                duration: 0.1,        
            })
            .to("#circle" + c_i, {
                opacity: 100,
                x: getRandomNumber(10, signinModal.clientWidth - 100),
                y: getRandomNumber(10, signinModal.clientHeight - 100),
                duration: getRandomNumber(10, 20),        
                ease: "power2.inOut",    
            })
            .to("#circle" + c_i, {
                scale: 0.5,
                x: getRandomNumber(10, signinModal.clientWidth - 100),
                y: getRandomNumber(10, signinModal.clientHeight - 100),
                duration: getRandomNumber(10, 20),            
            })
            .to("#circle" + c_i, {
                x: getRandomNumber(10, signinModal.clientWidth - 100),
                y: getRandomNumber(10, signinModal.clientHeight - 100),
                duration: getRandomNumber(10, 20),            
            });
        }
    }
    // popup message
    function popupMessage(status, message){
        opObj.status = status;
        opObj.message = message;

        document.getElementById("alertMsg").classList.remove("hidden");

        setTimeout(() => {
            document.getElementById("alertMsg").classList.add("hidden");
        }, 5000);
    }

</script>

<template>
    <!-- 系統 loading mask -->
    <div id="loading" class="w-full h-full flex justify-center items-center bg-gray-700/70 absolute top-0 left-0 z-999" style="display:none;">
        <progress class="w-5/10 progress progress-neutral" max="100"></progress>
    </div>
    <!-- 功能 component -->
    <div class="navbar bg-slate-200/100 h-[10px] fixed top-0 left-0 z-50">
        <div class="flex-1">
            <a class="btn btn-ghost text-xl" @click="gotoPage('gallery')">
                <span>{{ appSetting.title }}</span>
            </a>
        </div>
        <div class="flex-none">
            <ul class="menu menu-horizontal bg-slate-200/100 rounded-box w-10/10">
                <!-- setting -->
                <li v-if="userInfo.funcs.indexOf('setting') !== -1" @click="gotoPage('set_system')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.app_setting">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
                <!-- userInfo -->
                <li @click="openUserInfoModal">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.user_setting">
                        <svg class="w-5 h-5" :class="{'text-lime-900/100': userInfo.role === 'admin', 'text-yellow-900/100': userInfo.role === 'tn100'}"
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    <!-- 為了製造出"功能 menu 白霧底效果" -->
    <div class="navbar bg-white opacity-50 h-[10px] fixed top-15 left-0 z-50">
    </div>
    <!-- 功能 menu -->
    <div class="navbar shadow-lg h-[10px] fixed top-15 left-0 z-50 flex flex-row content-center gap-5 overflow-x-auto">
        <button v-if="userInfo.funcs.indexOf('quiz') !== -1" class="btn btn-ghost text-black font-black" @click="gotoPage('quiz')">{{ userInfo.languages.quiz }}</button>
        <button v-if="userInfo.funcs.indexOf('footmark') !== -1" class="btn btn-ghost" @click="gotoPage('footmark')">{{ userInfo.languages.footmark }}</button>
        <button v-if="userInfo.funcs.indexOf('finance') !== -1" class="btn btn-ghost" @click="gotoPage('finance')">{{ userInfo.languages.finance }}</button>
        <button v-if="userInfo.funcs.indexOf('chat') !== -1" class="btn btn-ghost" @click="gotoPage('chat')">{{ userInfo.languages.chat }}</button>
        <button v-if="userInfo.funcs.indexOf('lockLucky') !== -1" class="btn btn-ghost" @click="gotoPage('lockLucky')">{{ userInfo.languages.lockLucky }}</button>
        <button v-if="userInfo.funcs.indexOf('readme') !== -1" class="btn btn-ghost" @click="gotoPage('readme')">{{ userInfo.languages.readme }}</button>
    </div>
    <!-- 功能 component -->
    <div class="p-4 h-8/10 mt-30">
        <Gallery v-if="appSetting.contentComponent === 'gallery'" :title="appSetting.title" />
        <Quiz v-else-if="appSetting.contentComponent === 'quiz'" :title="appSetting.title" :setting="appSetting.quiz" />
        <Readme v-else-if="appSetting.contentComponent === 'readme'" :title="appSetting.title" :resources="appSetting.resources"  @introduce-author="gotoIntroduceAuthor" />
        <Footmark v-else-if="appSetting.contentComponent === 'footmark'" :title="appSetting.title" :account="userInfo.account" :googleMapApiKey="appSetting.googleMapApiKey" @popup-message="popupMessage" />
        <Finance v-else-if="appSetting.contentComponent === 'finance'" :title="appSetting.title" :account="userInfo.account" />
        <Setting v-else-if="appSetting.contentComponent === 'setting'" :title="appSetting.title" :account="userInfo.account" :quiz_setting="appSetting.quiz" :app_state="appState" @popup-message="popupMessage" />
        <Chat v-else-if="appSetting.contentComponent === 'chat'" :title="appSetting.title" :account="userInfo.account" />
        <Author v-else-if="appSetting.contentComponent === 'author'" :title="appSetting.title" />
        <LockLucky v-else-if="appSetting.contentComponent === 'lockLucky'" />
    </div>

    <!-- signin modal -->
    <dialog id="signinModal" class="modal">
        <div class="modal-box h-10/10 w-10/10 md:h-8/10 md:w-8/10 flex flex-col place-content-center bg-neutral-500 overflow-hidden">

            <div class="h-auto w-10/10 flex flex-col place-content-center rounded-2xl bg-white p-3">
                <h3 class="text-lg font-bold text-center">Hello!</h3>
                <h4 v-if="signinError" class="text-red-900 text-center mb-5">Error! 登入失敗~ 請檢查登入帳號!</h4>
                <div class="flex justify-center items-center join z-51">
                    <input id="signinName" type="text" placeholder="What's your name?" class="input input-ghost join-item" :value="tempAccount" @change="keyinAccount" @keyup.enter="signin" autofocus />
                    <button class="btn btn-primary join-item ml-1" @click="signin" >
                        <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="circle0" class="circle fixed top-0 left-0 rounded-full size-[35px] border-3 border-fuchsia-900 opacity-0"></div>
            <div id="circle1" class="circle fixed top-0 left-0 rounded-full size-[55px] border-3 border-green-900 opacity-0"></div>
            <div id="circle2" class="circle fixed top-0 left-0 rounded-full size-[75px] border-3 border-blue-900 opacity-0"></div>
            <div id="circle3" class="circle fixed top-0 left-0 rounded-full size-[100px] border-3 border-red-900 opacity-0"></div>
            <div id="circle4" class="circle fixed top-0 left-0 rounded-full size-[125px] border-3 border-neutral-900 opacity-0"></div>
            <div id="circle5" class="circle fixed top-0 left-0 rounded-full size-[155px] border-3 border-emerald-900 opacity-0"></div>
            <div id="circle6" class="circle fixed top-0 left-0 rounded-full size-[185px] border-3 border-teal-900 opacity-0"></div>
            <div id="circle7" class="circle fixed top-0 left-0 rounded-full size-[215px] border-3 border-sky-900 opacity-0"></div>
            <div id="circle8" class="circle fixed top-0 left-0 rounded-full size-[245px] border-3 border-lime-900 opacity-0"></div>
            <div id="circle9" class="circle fixed top-0 left-0 rounded-full size-[275px] border-3 border-rose-900 opacity-0"></div>
        </div>
    </dialog>
    <!-- userInfo modal -->
    <dialog id="userInfoModal" class="modal">
        <div class="modal-box bg-gray-800/80 rounded-box p-2 w-80 md:w-120">
            <li class="text-white text-lg">{{ userInfo.name }}</li>
            <li v-if="userInfo.mail" class="text-white text-lg">{{ userInfo.mail }}</li>
            <div class="divider"></div>
            <li class="flex flex-row gap-2 w-10/10">
                <button v-if="userInfo.account" class="btn w-5/10" @click="gotoPage('set_person')">
                    <svg class="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    </svg>
                    {{ userInfo.languages["user_setting"] }}
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
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>

    <PopupMessage id="alertMsg" class="hidden" :status="opObj.status" :message="opObj.message" />
</template>

<style scoped>

</style>
