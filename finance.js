import { ref, reactive, defineProps } from 'vue'

const template = `

<h1>Finance Management</h1>


  `;

export default {
    props: ['title', 'setting'],
    template: template,
    setup(props) {
        const appState = ref("");

        // 初始化 component
        function init(){
            console.log("finance.init");
        }

        return {
            appState,

            init,
        }
    },
    created(){
        console.log("finance.created");
    },
    mounted(){
        console.log("finance.mounted");

        this.init();
    }
}