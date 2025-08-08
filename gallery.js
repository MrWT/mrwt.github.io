import { ref, reactive } from 'vue'

export default {
    setup() {
        let appState = ref("");
        // 選擇的圖片 url
        let selImgUrl = ref("");
        // 生成的磚塊清單
        let masonryBricks = reactive([]);
        // 圖片清單
        let imageUrls = reactive([
            "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
            "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
            "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
            "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
            "https://img.daisyui.com/images/stock/453966.webp",
        ]);

        // 初始化 component
        function init(){
            console.log("gallery.init");
            // 建立區塊
            genBricks();
        }

        // 建立區塊
        function genBricks(imageUrl){
          let brickCount = getRandomNumber(5, 10);

          let imageBrickIndexs = [];
          imageUrls.forEach((iu, iu_i) => {
            while(imageBrickIndexs.length < imageUrls.length){
              let randomIndex = getRandomNumber(0, brickCount);

              if(imageBrickIndexs.indexOf(randomIndex) < 0){
                imageBrickIndexs.push(randomIndex);
              }
            }
          });

          for(let mb_i = 0; mb_i < brickCount; mb_i++){
            let gridRow = "";
            let gridCol = "";
            let imgSrc = null;
            let bgColor = "#" 
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16)
                        + getRandomNumber(0, 15).toString(16);
                                  
            if(imageBrickIndexs.indexOf(mb_i) >= 0){
              imgSrc = imageUrls[ imageBrickIndexs.indexOf(mb_i) ];
            }
            let rowSpan = imgSrc ? 5 : getRandomNumber(2, 5);
            let colSpan = imgSrc ? 1 : getRandomNumber(1, 3);
            gridRow = rowSpan > 0 ? ("grid-row: span " + rowSpan + ";") : "";
            gridCol = colSpan > 0 ? ("grid-column: span " + colSpan + ";") : "";

            masonryBricks.push({
              text: "",
              style: "background-color: " + bgColor + ";" + gridRow + gridCol,
              //gridRow: gridRow,
              //gridCol: gridCol,
              imgSrc: imgSrc,
            });
          }
        }

        // showModal
        function showModal(imgUrl){
          selImgUrl.value = imgUrl;
          document.getElementById("imgModal").showModal();
        }

        return {
            appState,
            selImgUrl,
            masonryBricks,

            init,
            showModal,
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

      // object-scale-down
    },
    template: `

<div class="w-full h-10/10 overflow-y-auto grid grid-flow-row-dense">
    <!-- masonry 效果定義於 masonry.css -->
    <div class="masonry">
        <div v-for="(mbObj, mb_i) in masonryBricks" class="masonry-item" :style="mbObj.style">
            <img v-if="mbObj.imgSrc !== null" :src="mbObj.imgSrc" class="h-20 w-96 object-fill cursor-pointer" @click="showModal(mbObj.imgSrc)" />
            <span v-if="mbObj.imgSrc === null">{{ mbObj.text }}</span>
        </div>
    </div>
</div>

<dialog id="imgModal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <div class="w-10/10 h-10/10">
      <img :src="selImgUrl" class="object-none" />
    </div>

    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

  `
}