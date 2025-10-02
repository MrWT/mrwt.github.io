<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import moment from 'moment'
    import { fetchData } from "@/composables/fetchData"

    const props = defineProps({
        title: String,
        account: String
    })

    onMounted(() => {
        console.log("Chat mounted.");
        init();
    });

    let appState = ref("");
    let userMessage = ref("");
    let messages = reactive([]);
    let userInfo = reactive({});

    // 初始化 component
    function init(){
        console.log("chat.init");
        console.log("chat.props.title", props.title);
        console.log("chat.props.account", props.account);

        fetchUserInfo();
        chat("Hi");
    }
    // 取得 user 資料
    function fetchUserInfo(){
        let fetchUserInfoPromise = fetchData({
            api: "get_user",
            data: {
                account: props.account,
            }
        });
        Promise.all([fetchUserInfoPromise]).then((values) => {
            console.log("fetchUserInfoPromise.values=", values);
            userInfo = values[0];
        });
    }
    // chat with ai
    function chat(message){
        console.log("chat.message=" + message);

        let chatPromise = fetchData({
            api: "chat",
            data: {
                message: message,
            }
        });
        Promise.all([chatPromise]).then((values) => {
            console.log("chatPromise.values=", values);

            messages.push({
                role: "AI",
                speaker: "AI",
                message: values[0]["message"],
                time: moment().format("HH:mm:ss"),
            });

            setTimeout(() => {
                let chatBoxElement = document.getElementById("chatBox");
                chatBoxElement.scrollTo(0, chatBoxElement.scrollHeight);
            }, 100);
        });
    }
    // 送出 message
    function send(){
        let user_name = userInfo.language === "EN" ? userInfo.name : userInfo.cname;

        messages.push({
            role: "user",
            speaker: user_name,
            short_name: props.account.substr(0, 1),
            message: userMessage.value,
            time: moment().format("HH:mm:ss"),
        });

        chat(userMessage.value);

        setTimeout(() => {
            userMessage.value = "";
            let chatBoxElement = document.getElementById("chatBox");
            chatBoxElement.scrollTo(0, chatBoxElement.scrollHeight);
        }, 100);
    }        
        

</script>

<template>

<div id="chatBox" class="flex flex-col w-10/10 h-9/10 overflow-y-auto">
    <div v-for="(msgObj, msg_i) in messages" class="chat"
        :class="{ 'chat-start': msgObj.role === 'AI', 'chat-end': msgObj.role === 'user' }">
        <div class="chat-image avatar">
            <div class="avatar avatar-placeholder">
                <div class="w-8 rounded-full"
                    :class="{'bg-neutral': msgObj.role === 'AI', 'text-gray-100': msgObj.role === 'AI',
                             'bg-green-500': msgObj.role === 'user', 'text-gray-900': msgObj.role === 'user'}">
                    <span v-if="msgObj.role === 'AI'" class="text-xs">AI</span>
                    <span v-if="msgObj.role === 'user'" class="text-xs">{{ msgObj.short_name }}</span>
                </div>
            </div>
        </div>
        <div class="chat-header">
            {{ msgObj.speaker }}
            <time class="text-xs opacity-50">{{ msgObj.time }}</time>
        </div>
        <div class="chat-bubble">{{ msgObj.message }}</div>
    </div>
</div>

<div class="join join-horizontal absolute bottom-5 left-0 z-55 w-10/10 justify-center bg-gray-200">
    <input type="text" placeholder="想說點什麼呢?" class="input input-info join-item w-8/10" v-model="userMessage" @keyup.enter="send" />
    <button class="btn join-item bg-gray-700 btn-circle" @click="send">
        <svg class="w-6 h-6 text-white rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clip-rule="evenodd"/>
        </svg>
    </button>
</div>

</template>

<style scoped>

</style>
