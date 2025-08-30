import { ref, reactive, defineProps } from 'vue'

const template = `

<h1>Finance Management</h1>
<h3>買房進度</h3>
<div class="radial-progress" :style="radialProgressStyle" :aria-valuenow="houseProgress" role="progressbar">{{ houseProgress }}%</div>

  `;

export default {
    props: ['title', 'account'],
    template: template,
    setup(props) {
        let appState = ref("");
        let houseProgress = ref(0);
        let radialProgressStyle = ref("--value:0");
        let finance = reactive({});

        // 初始化 component
        function init(){
            console.log("finance.init");
            console.log("props.title=", props.title);
            console.log("props.account=", props.account);

            fetchFinanceData();
        }

        function fetchFinanceData() {
            let fetchUserFinance = fetchData({
                api: "get_finance",
                data: {
                    account: props.account
                }
            });
            Promise.all([fetchUserFinance]).then((values) => {
                finance = values[0];
                console.log("finance=", finance);

                houseProgress.value = 10;
                radialProgressStyle.value = "--value:" + houseProgress.value;
            });
        }

        return {
            appState,
            houseProgress,
            radialProgressStyle,

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