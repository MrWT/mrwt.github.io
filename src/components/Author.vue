<script setup>
    import { ref, reactive, onMounted } from 'vue'

    const props = defineProps({
        title: String,
        account: String
    })

    onMounted(() => {
        console.log("Author mounted.");
        init();
    });

    let appState = ref("");
    let dataList = reactive([]);

    // 初始化 component
    function init(){
        console.log("author.init");
        console.log("author.props.title", props.title);

        genDataList();
    }     

    function genDataList(){
        dataList.push({
            time: "1987/04",
            title: "出生於台南市",
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA",
        });

        dataList.push({
            time: "1994/09",
            title: "台南市立安慶國小",
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA",
        });

        dataList.push({
            time: "2000/09",
            title: "台南市立安南國中",
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA",
        });

        dataList.push({
            time: "2003/09",
            title: "台南高工-資訊科",
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA",
        });

        dataList.push({
            time: "2006/09",
            title: "台灣科技大學-資訊工程系",
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA ABCDEFGHIJKLMNOPQRSTUVWXYZ ZYXWVUTSRQPONMLKJIHGFEDCBA",
        });
    }

</script>

<template>

<div class="w-10/10">
    <div class="text-lg">作者簡介</div>
</div>

<div class="w-10/10">

    <ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        <li v-for="(dataObj, data_i) in dataList">
            <hr />
            <div class="timeline-middle">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="h-5 w-5"
                >
                    <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clip-rule="evenodd"
                    />
                </svg>
            </div>
            <div :class="{'timeline-start mb-10 md:text-end': data_i % 2 === 0, 'timeline-end md:mb-10': data_i % 2 === 1}">
                <time class="font-mono italic">{{ dataObj.time }}</time>
                <div class="text-lg font-black">{{ dataObj.title }}</div>
                {{ dataObj.content }}
            </div>
            <hr />
        </li>
    </ul>

</div>

</template>

<style scoped>

</style>
