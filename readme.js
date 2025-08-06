import { ref, reactive, defineProps } from 'vue'

export default {
  props: ['title'],
  setup(props) {
    const appState = ref("");
    const resource = reactive({
        vueJS: "https://vuejs.org/",
        tailwindCSS: "https://tailwindcss.com/",
        daisyUI: "https://daisyui.com/",
        ml5_learn: "https://dopeorion.medium.com/%E5%85%A8%E7%AB%AF%E7%94%9F%E6%B4%BB-ml5-js-%E4%B8%8D%E5%98%B4%E7%A0%B2%E5%AF%A6%E5%81%9A-77ac79a28773",
    });

    return {
        props,
        appState,
        resource,                        
    }
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