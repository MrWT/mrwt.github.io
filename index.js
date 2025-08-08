
// 取得檔案  json 內容
function fetchJson(jsonFileName){
    if(!jsonFileName) return  null;

    let fetchJsonPromise = new Promise((resolve, reject) => {
        fetch("./resource/" + jsonFileName)
            .then((response) => response.json() )
            .then((json) => { 
                resolve(json);
            });
    });
    return fetchJsonPromise;
}

// 取得真亂數
function getRandomNumber(min, max){
    // Example using window.crypto.getRandomValues() for cryptographically secure random numbers
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const secureRandomNumber = array[0] / (2**32); // Normalize to a float between 0 and 1

    return Math.floor(secureRandomNumber * (max - min + 1)) + min;
}