<script setup>
    import { ref, reactive, onMounted } from 'vue'
    
    const emit = defineEmits(['introduceAuthor']);
    const props = defineProps({
        title: String,
        resources: Array,
    })

    onMounted(() => {
        console.log("Readme mounted.");
        init();
    });

    let appState = ref("");
    let screenSize = ref("md");

    // 初始化 component
    function init(){
        console.log("props.title=", props.title);
        console.log("props.resources=", props.resources);

        // w-sm 約等於 384px
        // w-md 約等於 448px
        //console.log("window.innerWidth=" + window.innerWidth);
        if(window.innerWidth > 448){
            screenSize.value = "md";
        }else if(304 < window.innerWidth && window.innerWidth < 448 ){
            screenSize.value = "sm";
        }else{
            screenSize.value = "xs";
        }

    }

    // 驅動 parent component 前往 author.js component
    function gotoIntroduceAuthor(){
        emit('introduceAuthor', 'author'); // Emitting the event with data
    }

</script>

<template>

    <div class="divider">系統架構</div>
    <div class="flex flex-col md:flex-row w-10/10 h-fit md:h-3/10">
        <div v-if="screenSize !== 'md'" class="divider">User Interfase</div>
        <div class="card bg-base-300 rounded-box grid h-[200px] md:h-10/10 w-10/10 md:w-3/10 place-items-center">
            <div class="w-10/10 h-10/10 p-2">
                <div class="text-2xl underline text-center mb-2">Firebase Hosting</div>

                <div class="flex flex-wrap justify-center">
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-base bg-green-200">DaisyUI</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-xl bg-teal-300">TailwindCSS</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-lg bg-yellow-300/50">gsap.js</div>
                    <div class="py-2 px-1 justify-center content-center rounded-4xl w-fit text-sm bg-blue-100">ApexChart</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-2xl bg-red-300">VueJS</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-xl bg-orange-200">Vite</div>
                </div>
            </div>
        </div>

        <div v-if="screenSize === 'md'" class="divider md:divider-horizontal"><--></div>
        <div v-if="screenSize !== 'md'" class="divider">Web API</div>
        <div class="card bg-base-300 rounded-box grid h-[200px] md:h-10/10 w-10/10 md:w-3/10 place-items-center">
            <div class="w-10/10 text-center text-2xl underline">Cloud Run ( Python )</div>
        </div>

        <div v-if="screenSize === 'md'" class="divider md:divider-horizontal"><--></div>
        <div v-if="screenSize !== 'md'" class="flex flex-row w-10/10 gap-2">
            <div class="w-5/10">
                <div class="divider">Database</div>
            </div>
            <div class="w-5/10">
                <div class="divider">AI Agent</div>
            </div>
        </div>
        <div class="flex flex-row md:flex-col h-[200px] md:h-10/10 w-10/10 md:w-3/10 gap-2">
            <div class="card bg-base-300 rounded-box grid h-10/10 w-5/10 md:h-5/10 md:w-10/10 place-items-center">
                <div class="w-10/10 text-center text-2xl underline">Firestore <br v-if="screenSize !== 'md'" />( NoSQL )</div>
            </div>
            <div class="card bg-base-300 rounded-box grid h-10/10 w-5/10 md:h-5/10 md:w-10/10 place-items-center">
                <div class="w-10/10 text-center text-2xl underline">Vertex AI <br v-if="screenSize !== 'md'" />( Gemini )</div>
            </div>
        </div>
    </div>

    <div class="divider">實作技術參考</div>
    <ul class="list bg-base-100 rounded-box h-fit w-10/10 overflow-y-auto shadow-2xl">
        <li v-for="resObj in props.resources" class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">{{ resObj.index }}</div>
            <div class="list-col-grow">
                <div>{{ resObj.text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ resObj.link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="resObj.link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>
    </ul>

    <div class="divider"></div>
    <div class="w-10/10 text-center">
        <a class="cursor-pointer underline text-2xl" @click="gotoIntroduceAuthor">作者簡介</a>
    </div>

    <div class="divider"></div>


</template>

<style scoped>

</style>
