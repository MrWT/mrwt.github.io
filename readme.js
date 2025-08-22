import { ref, reactive, defineProps } from 'vue'

const template = `

    <div class='text-center text-3xl mt-10 md:mt-0'>Hello! Welcome to {{ props.title }}</div>

    <!-- 實作技術參考 -->
    <ul class="list bg-base-100 rounded-box shadow-md">  
        <li class="p-4 pb-2 text-lg opacity-60 tracking-wide">實作技術參考</li>
        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">01</div>
            <div class="list-col-grow">
                <div>{{ props.resources[0].text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ props.resources[0].link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="props.resources[0].link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">02</div>
            <div class="list-col-grow">
                <div>{{ props.resources[1].text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ props.resources[1].link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="props.resources[1].link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">03</div>
            <div class="list-col-grow">
                <div>{{ props.resources[2].text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ props.resources[2].link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="props.resources[2].link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">04</div>
            <div class="list-col-grow">
                <div>{{ props.resources[3].text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ props.resources[3].link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="props.resources[3].link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>

        <li class="list-row hover:bg-yellow-300/10">
            <div class="text-4xl font-thin opacity-30 tabular-nums">05</div>
            <div class="list-col-grow">
                <div>{{ props.resources[4].text }}</div>
                <div class="text-xs lowercase font-semibold opacity-60">{{ props.resources[4].link }}</div>
            </div>
            <button class="btn btn-square btn-ghost">
                <a :href="props.resources[4].link" target="_blank">
                    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
                </a>
            </button>
        </li>
    </ul>
  `;

export default {
    props: ['title', 'resources'],
    template: template,
    setup(props) {
        let appState = ref("");

        // 初始化 component
        function init(){
           console.log("props.title=", props.title);
        }

        return {
            props,
            appState,
            
            init,
        }
    },
    beforeCreate(){
        console.log("readme.beforeCreate");
    },
    created(){
        console.log("readme.created");
    },
    beforeMount(){
        console.log("readme.beforeMount");
    },
    mounted(){
        console.log("readme.mounted");
        this.init();
    },
}