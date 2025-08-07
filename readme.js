import { ref, reactive, defineProps } from 'vue'

export default {
    props: ['title'],
    setup(props) {
        let appState = ref("");
        let resource = reactive({});

        // 初始化 component
        function init(rJsonObj){
            console.log("readme.init", rJsonObj);

            resource = rJsonObj;
        }

        return {
            props,
            appState,
            resource,    
            
            init,
        }
    },
    created(){
        console.log("readme.created");
    },
    mounted(){
        console.log("readme.mounted");
        
        // 取得系統資料
        let fetchReadme = fetchJson("readme.json");
        Promise.all([fetchReadme]).then((values) => {
            //console.log(values); 
            let rJsonObj = values[0];
            this.init(rJsonObj);
        });
    },
    template: `

    <div class='text-center text-3xl mt-10 md:mt-0'>Hello! Welcome to {{ props.title }}</div>

    <!-- 實作技術參考 -->
    <ul class="list bg-base-100 rounded-box shadow-md">  
        <li class="p-4 pb-2 text-lg opacity-60 tracking-wide">實作技術參考</li>
        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">01</div>
            <div class="list-col-grow">
                <div>VueJS</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ resource.vueJS }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="resource.vueJS" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>
    
        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">02</div>
            <div class="list-col-grow">
                <div>TailwindCSS</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ resource.tailwindCSS }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="resource.tailwindCSS" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">03</div>
            <div class="list-col-grow">
                <div>DaisyUI</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ resource.daisyUI }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="resource.daisyUI" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">04</div>
            <div class="list-col-grow">
                <div>Learn ml5.js</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ resource.ml5_learn }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="resource.ml5_learn" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

    </ul>
  `
}