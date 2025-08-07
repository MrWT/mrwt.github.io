
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