import { ref, reactive } from 'vue'

export default {
    setup() {
        let appState = ref("");
        let masonryItems = reactive([]);
        let imageUrls = reactive([
            "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
            "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
            "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
            "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
        ]);

        // 初始化 component
        function init(){
            console.log("gallery.init");

            genBricks();
        }

        // 建立區塊
        function genBricks(imageUrl){
          let brickCount = Math.floor(Math.random() * 10) + 5;

          let imageBrickIndexs = [];
          imageUrls.forEach((iu, iu_i) => {
            while(imageBrickIndexs.length < imageUrls.length){
              let randomIndex = Math.floor(Math.random() * brickCount) + 0;

              if(imageBrickIndexs.indexOf(randomIndex) < 0){
                imageBrickIndexs.push(randomIndex);
              }
            }
          });

          for(let mi_i = 0; mi_i < brickCount; mi_i++){
            let gridRow = "";
            let gridCol = "";
            let imgSrc = null;
            let bgColor = "#" 
                        + Math.floor(Math.random() * 15).toString(16)
                        + Math.floor(Math.random() * 15).toString(16)
                        + Math.floor(Math.random() * 15).toString(16)
                        + Math.floor(Math.random() * 15).toString(16)
                        + Math.floor(Math.random() * 15).toString(16)
                        + Math.floor(Math.random() * 15).toString(16);
                                  
            if(imageBrickIndexs.indexOf(mi_i) >= 0){
              imgSrc = imageUrls[ imageBrickIndexs.indexOf(mi_i) ];
            }
            let rowSpan = imgSrc ? 8 : ( Math.floor(Math.random() * 5) + 3 );
            let colSpan = imgSrc ? 0 : ( Math.floor(Math.random() * 5) + 0 );
            gridRow = rowSpan > 0 ? ("grid-row: span " + rowSpan + ";") : "";
            gridCol = colSpan > 0 ? ("grid-column: span " + colSpan + ";") : "";

            masonryItems.push({
              text: "Item " + (mi_i + 1),
              style: "background-color: " + bgColor + ";" + gridRow + gridCol,
              //gridRow: gridRow,
              //gridCol: gridCol,
              imgSrc: imgSrc,
            });
          }

          console.log("masonryItems=", masonryItems);
        }

        return {
            appState,
            masonryItems,

            init,
        }
    },
    created(){
      console.log("gallery.created");
    },
    mounted(){
      console.log("gallery.mounted");
      this.init();

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));

      }, 1000);
    },
    template: `

<div class="w-full h-10/10 overflow-y-auto grid grid-flow-row-dense">
    <!-- masonry 效果定義於 masonry.css -->
    <div class="masonry">
        <div v-for="(miObj, mi_i) in masonryItems" class="masonry-item" :style="miObj.style">
            <img v-if="miObj.imgSrc !== null" :src="miObj.imgSrc" class="object-scale-down" />
            <span v-if="miObj.imgSrc === null">{{ miObj.text }}</span>
        </div>

        <!--
        <div class="masonry-item" style="grid-row: span 8; grid-column: span 3; background-color: #ff6f61;">
            <img src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp" />
        </div>
        <div class="masonry-item" style="grid-row: span 8; background-color: #6b5b95;">
            Item 2
        </div>
        <div class="masonry-item" style="grid-row: span 8; background-color: #88b04b; ">
            Item 3
        </div>
        <div class="masonry-item" style="grid-row: span 8; grid-column: span 3; background-color: #d65076;">
            <img src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp" />
        </div>
        <div class="masonry-item" style="grid-row: span 8; grid-column: span 3; background-color: #ffb347;">
            <img src="https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp" />
        </div>
        <div class="masonry-item" style="grid-row: span 8; background-color: #45b8ac;">
            Item 6
        </div>
        <div class="masonry-item" style="grid-row: span 10; background-color: #e94b3c;">
            Item 7
        </div>
        <div class="masonry-item" style="grid-row: span 8; grid-column: span 3; background-color: #6c5b7b;">
            <img src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp" />
        </div>
        <div class="masonry-item" style="grid-row: span 8; grid-column: span 3; background-color: #00a86b;">
            Item 9
        </div>
        <div class="masonry-item" style="grid-row: span 20; background-color: #b565a7; ">
            Item 10
        </div>
        -->
    </div>
</div>
  `
}