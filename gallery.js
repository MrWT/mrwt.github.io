import { ref, reactive } from 'vue'

export default {
    setup() {
        const appState = ref("");

        // 初始化 component
        function init(){
          console.log("gallery.init");
        }

        return {
            appState,

            init,
        }
    },
    created(){
      console.log("gallery.created");
    },
    mounted(){
      console.log("gallery.mounted");
      this.init();
    },
    template: `
<div class="w-full h-10/10 overflow-y-auto grid grid-flow-row-dense">
  <div>
    <img src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp" class="w-full h-full object-fill" />
  </div>
  <div>
    <img src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp" class="w-full h-full object-fill" />
  </div>
  <div>    
    <img src="https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp" class="w-full h-full object-fill" />
  </div>
  <div>
    <img src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp" class="w-full h-full object-fill" />
  </div>
</div>
  `
}