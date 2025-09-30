<script setup>
    import { gsap } from "gsap"

    import { ref, reactive, onMounted } from 'vue'
    import Finance from './components/Finance.vue'
    import Gallery from './components/Gallery.vue'
    import Restaurant from './components/Restaurant.vue'
    import Quiz from './components/Quiz.vue'
    import Readme from './components/Readme.vue'
    import Setting from './components/Setting.vue'
    import Chat from './components/Chat.vue'
    import Author from './components/Author.vue'
    import LuckyMe from './components/LuckyMe.vue'

    onMounted(() => {
        console.log("App mounted.");
        init();

        // 沒有使用者資訊時, 跳出 signinModal
        if(!userInfo.account){
            document.getElementById("signinModal").showModal();
            setTimeout(() => {
                document.getElementById("signinName").focus();

                genAnimation_gsap();
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
                    let google_map_api_src = "https://maps.googleapis.com/maps/api/js?key=" + appSettingObj["google_map_key"] + "&loading=async";
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

    function genAnimation_gsap(){
        gsap.set(".ball",{
            xPercent: -50,
            yPercent: -50,
        });

        window.addEventListener("mousemove", e => {
            gsap.to(".ball" , {
                x: e.pageX,
                y: e.pageY,
                duration: 0.4,
                stagger: {
                    each: 0.05,
                    from: "end"
                }
            })
        });
    }

</script>

<template>
    <!-- 系統 loading mask -->
    <div id="loading" class="w-full h-full flex justify-center items-center bg-gray-700/70 absolute top-0 left-0 z-999" style="display:none;">
        <span class="loading loading-spinner text-white loading-xl"></span>
        <span class="sr-only">Loading...</span>
    </div>

    <div class="navbar bg-slate-200/100 shadow-lg h-1/10 fixed top-0 left-0 z-50">
        <div v-if="(screenSize === 'md' || (screenSize !== 'md' && !switchMenu))" class="flex-1">
            <a class="btn btn-ghost text-xl" @click="gotoPage('gallery')">
                <span>{{ appSetting.title }}</span>
            </a>
        </div>
        <div class="place-items-center" :class="{'w-10/10': switchMenu && screenSize !== 'md', 
                      'flex-none': !switchMenu && screenSize !== 'md',
                      'flex-none': screenSize === 'md'}">
            <ul class="menu menu-horizontal bg-slate-200/100 rounded-box" 
               :class="{'w-8/10': switchMenu && screenSize !== 'md'}">
                <!-- quiz -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('quiz') !== -1" @click="gotoPage('quiz')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.quiz">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 9a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
                            <path fill-rule="evenodd" d="M9.896 3.051a2.681 2.681 0 0 1 4.208 0c.147.186.38.282.615.255a2.681 2.681 0 0 1 2.976 2.975.681.681 0 0 0 .254.615 2.681 2.681 0 0 1 0 4.208.682.682 0 0 0-.254.615 2.681 2.681 0 0 1-2.976 2.976.681.681 0 0 0-.615.254 2.682 2.682 0 0 1-4.208 0 .681.681 0 0 0-.614-.255 2.681 2.681 0 0 1-2.976-2.975.681.681 0 0 0-.255-.615 2.681 2.681 0 0 1 0-4.208.681.681 0 0 0 .255-.615 2.681 2.681 0 0 1 2.976-2.975.681.681 0 0 0 .614-.255ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clip-rule="evenodd"/>
                            <path d="M5.395 15.055 4.07 19a1 1 0 0 0 1.264 1.267l1.95-.65 1.144 1.707A1 1 0 0 0 10.2 21.1l1.12-3.18a4.641 4.641 0 0 1-2.515-1.208 4.667 4.667 0 0 1-3.411-1.656Zm7.269 2.867 1.12 3.177a1 1 0 0 0 1.773.224l1.144-1.707 1.95.65A1 1 0 0 0 19.915 19l-1.32-3.93a4.667 4.667 0 0 1-3.4 1.642 4.643 4.643 0 0 1-2.53 1.21Z"/>
                        </svg>
                    </a>
                </li>
                <!-- restaurant -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('restaurant') !== -1" @click="gotoPage('restaurant')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.restaurant">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M5.535 7.677c.313-.98.687-2.023.926-2.677H17.46c.253.63.646 1.64.977 2.61.166.487.312.953.416 1.347.11.42.148.675.148.779 0 .18-.032.355-.09.515-.06.161-.144.3-.243.412-.1.111-.21.192-.324.245a.809.809 0 0 1-.686 0 1.004 1.004 0 0 1-.324-.245c-.1-.112-.183-.25-.242-.412a1.473 1.473 0 0 1-.091-.515 1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.401 1.401 0 0 1 13 9.736a1 1 0 1 0-2 0 1.4 1.4 0 0 1-.333.927.896.896 0 0 1-.667.323.896.896 0 0 1-.667-.323A1.4 1.4 0 0 1 9 9.74v-.008a1 1 0 0 0-2 .003v.008a1.504 1.504 0 0 1-.18.712 1.22 1.22 0 0 1-.146.209l-.007.007a1.01 1.01 0 0 1-.325.248.82.82 0 0 1-.316.08.973.973 0 0 1-.563-.256 1.224 1.224 0 0 1-.102-.103A1.518 1.518 0 0 1 5 9.724v-.006a2.543 2.543 0 0 1 .029-.207c.024-.132.06-.296.11-.49.098-.385.237-.85.395-1.344ZM4 12.112a3.521 3.521 0 0 1-1-2.376c0-.349.098-.8.202-1.208.112-.441.264-.95.428-1.46.327-1.024.715-2.104.958-2.767A1.985 1.985 0 0 1 6.456 3h11.01c.803 0 1.539.481 1.844 1.243.258.641.67 1.697 1.019 2.72a22.3 22.3 0 0 1 .457 1.487c.114.433.214.903.214 1.286 0 .412-.072.821-.214 1.207A3.288 3.288 0 0 1 20 12.16V19a2 2 0 0 1-2 2h-6a1 1 0 0 1-1-1v-4H8v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-6.888ZM13 15a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
                <!-- finance -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('finance') !== -1" @click="gotoPage('finance')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.finance">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z" clip-rule="evenodd"/>
                            <path fill-rule="evenodd" d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clip-rule="evenodd"/>
                            <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
                        </svg>
                    </a>
                </li>
                <!-- chat -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('chat') !== -1" @click="gotoPage('chat')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.chat">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
                <!-- luckyMe -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('luckyMe') !== -1" @click="gotoPage('luckyMe')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.chat">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.5 2c-.178 0-.356.013-.492.022l-.074.005a1 1 0 0 0-.934.998V11a1 1 0 0 0 1 1h7.975a1 1 0 0 0 .998-.934l.005-.074A7.04 7.04 0 0 0 22 10.5 8.5 8.5 0 0 0 13.5 2Z"/>
                            <path d="M11 6.025a1 1 0 0 0-1.065-.998 8.5 8.5 0 1 0 9.038 9.039A1 1 0 0 0 17.975 13H11V6.025Z"/>
                        </svg>
                    </a>
                </li>
                <!-- readme -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('readme') !== -1" @click="gotoPage('readme')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.readme">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm14 18a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4ZM5 11a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5Zm14 2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4Z"/>
                        </svg>
                    </a>
                </li>
                <!-- setting -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu)) && userInfo.funcs.indexOf('setting') !== -1" @click="gotoPage('set_system')">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.app_setting">
                        <svg class="w-5 h-5 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
                <!-- userInfo -->
                <li v-if="(screenSize === 'md' || (screenSize !== 'md' && switchMenu))" @click="openUserInfoModal">
                    <a class="tooltip tooltip-bottom" :data-tip="userInfo.languages.user_setting">
                        <svg class="w-5 h-5" :class="{'text-lime-900/100': userInfo.role === 'admin', 'text-yellow-900/100': userInfo.role === 'tn100'}"
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </li>
            </ul>

            <ul class="menu menu-horizontal bg-slate-200/100 rounded-box" 
               :class="{'w-2/10': switchMenu && screenSize !== 'md'}">
                <!-- screenSize 小於 md 時, 開啟 menu -->
                <li v-if="screenSize !== 'md' && !switchMenu" @click="toggleMenu">
                    <a>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> 
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path> 
                        </svg>
                    </a>
                </li>
                <!-- screenSize 小於 md 時, 關閉 menu -->
                <li v-if="screenSize !== 'md' && switchMenu" @click="toggleMenu">
                    <a>
                        <svg class="w-6 h-6 text-red-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </a>
                </li>
            </ul>
        </div>
    </div>

    <div class="p-4 h-9/10 mt-20 md:mt-15">
        <Gallery v-if="appSetting.contentComponent === 'gallery'" :title="appSetting.title" />
        <Quiz v-else-if="appSetting.contentComponent === 'quiz'" :title="appSetting.title" :setting="appSetting.quiz" />
        <Readme v-else-if="appSetting.contentComponent === 'readme'" :title="appSetting.title" :resources="appSetting.resources"  @introduce-author="gotoIntroduceAuthor" />
        <Restaurant v-else-if="appSetting.contentComponent === 'restaurant'" :title="appSetting.title" :account="userInfo.account" />
        <Finance v-else-if="appSetting.contentComponent === 'finance'" :title="appSetting.title" :account="userInfo.account" />
        <Setting v-else-if="appSetting.contentComponent === 'setting'" :title="appSetting.title" :account="userInfo.account" :quiz_setting="appSetting.quiz" :app_state="appState" />
        <Chat v-else-if="appSetting.contentComponent === 'chat'" :title="appSetting.title" :account="userInfo.account" />
        <Author v-else-if="appSetting.contentComponent === 'author'" :title="appSetting.title" />
        <LuckyMe v-else-if="appSetting.contentComponent === 'luckyMe'" />
    </div>

    <!-- signin modal -->
    <dialog id="signinModal" class="modal">
        <div class="modal-box h-10/10 w-10/10 md:h-7/10 md:w-7/10 flex flex-col place-content-center bg-neutral-500 overflow-hidden">

            <div class="h-auto w-10/10 flex flex-col place-content-center rounded-2xl bg-white p-3">
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

            <div class="ball fixed top-0 left-0 rounded-full size-[100px] border-3 border-red-900"></div>
            <div class="ball fixed top-0 left-0 rounded-full size-[75px] border-3 border-blue-900"></div>
        </div>
    </dialog>
     <!-- userInfo modal -->
    <dialog id="userInfoModal" class="modal">
        <div class="modal-box bg-gray-800/80 rounded-box p-2 w-80 md:w-120">
            <li class="text-white text-lg">{{ userInfo.name }}</li>
            <li v-if="userInfo.mail" class="text-white text-lg">{{ userInfo.mail }}</li>
            <div class="divider"></div>
            <li class="flex flex-row w-10/10">
                <button v-if="userInfo.account" class="btn w-5/10 mr-1" @click="gotoPage('set_person')">
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

</template>

<style scoped>

</style>
