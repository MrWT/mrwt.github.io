
// 取得檔案  json 內容
function fetchSysSetting(jsonFileName){
    if(!jsonFileName) return  null;

    let fetchJsonPromise = new Promise((resolve, reject) => {
        fetch("./sys_setting/" + jsonFileName)
            .then((response) => response.json() )
            .then((json) => { 
                resolve(json);
            });
    });
    return fetchJsonPromise;
}

// 至 Cloud Run Function 取得 Firestore 資料
function fetchData(postData){
    let fetchDataPromise = new Promise((resolve, reject) => {
        const cloudRunUrl = "https://coder-k49-582921678854.asia-east1.run.app/";

        fetch(cloudRunUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 設定內容類型為 JSON
            },
            body: JSON.stringify(postData) // 將 JavaScript 物件轉換為 JSON 字串
        })
        .then(response => {
            //console.log("response=", response);
            if (!response.ok) {
                reject(`HTTP error! status: ${response.status}`);
            }
            // 解析 JSON 格式的回應
            return response.json();
        })
        .then(data => {
            //console.log('Success:', data);
            resolve(data);
        })
        .catch(error => {
            console.error('Error:', error);
            reject('Error:' + error);
        });
    });

    return fetchDataPromise;
}

// 取得真亂數
function getRandomNumber(min, max){
    // Example using window.crypto.getRandomValues() for cryptographically secure random numbers
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const secureRandomNumber = array[0] / (2**32); // Normalize to a float between 0 and 1

    return Math.floor(secureRandomNumber * (max - min + 1)) + min;
}