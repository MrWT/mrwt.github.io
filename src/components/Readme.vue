<script setup>
    import { ref, reactive, onMounted } from 'vue'

    const props = defineProps({
        title: String,
        resources: Array,
    })

    onMounted(() => {
        console.log("Readme mounted.");
        init();
    });

    let appState = ref("");

    // 初始化 component
    function init(){
        console.log("props.title=", props.title);
        console.log("props.resources=", props.resources);
    }

</script>

<template>

<div class="flex flex-col w-10/10 h-10/10">
    <div class="divider">系統架構</div>
    <div class="flex flex-row w-10/10 h-5/10">
        <div class="card bg-base-300 rounded-box grid h-10/10 w-3/10 place-items-center">
            <div class="w-10/10 h-10/10 p-2">
                <div class="text-2xl underline text-center mb-2">Firebase Hosting</div>

                <div class="flex flex-wrap justify-center">
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-base bg-green-200">DaisyUI</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-2xl bg-teal-300">TailwindCSS</div>
                    <div class="py-2 px-1 justify-center content-center rounded-4xl w-fit text-sm bg-blue-100">ApexChart</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-3xl bg-red-300">VueJS</div>
                    <div class="p-2 justify-center content-center rounded-4xl w-fit text-xl bg-orange-200">Vite</div>
                </div>
            </div>
        </div>
        <div class="divider divider-horizontal"><--></div>
        <div class="card bg-base-300 rounded-box grid h-10/10 w-3/10 place-items-center">
            <div class="w-10/10 text-center text-2xl underline">Cloud Run ( Python )</div>
        </div>
        <div class="divider divider-horizontal"><--></div>
        <div class="card bg-base-300 rounded-box grid h-10/10 w-3/10 place-items-center">
            <div class="w-10/10 text-center text-2xl underline">Firestore ( NoSQL )</div>
        </div>
    </div>
    <div class="divider">實作技術參考</div>
    <div class="card bg-base-300 rounded-box grid h-5/10 w-10/10 place-items-center">
        <!-- 實作技術參考 -->
        <ul class="list bg-base-100 rounded-box shadow-md h-9/10 w-10/10 overflow-y-auto">
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
    </div>
</div>

</template>

<style scoped>

</style>
