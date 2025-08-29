import { ref, reactive, defineProps } from 'vue'

const template = `

<h1>系統設定</h1>


  `;

export default {
    props: ['title', 'setting'],
    template: template,
    setup(props) {
        const appState = ref("");

        // 初始化 component
        function init(){
            console.log("setting.init");
        }

        return {
            appState,

            init,
        }
    },
    created(){
        console.log("setting.created");
    },
    mounted(){
        console.log("setting.mounted");

        this.init();
    }
}