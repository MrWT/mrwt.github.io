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

    // 初始化 component
    function init(){
        console.log("author.init");
        console.log("author.props.title", props.title);
    }     
        

</script>

<template>

<h1>作者簡介</h1>

</template>

<style scoped>

</style>
