import fetch from 'dva/fetch';
var server = "http://192.168.0.105"

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return fetch(server+url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => ({ data }))
    .catch((err) => ({ err }));
}

export async function post(url,body) {
    const uri = server + encodeURI(url);
    console.log(uri);
    return fetch(uri,{
        method:'POST',
        headers:{
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(body)
    }).then(filterStatus).then(filterJSON);
}

function filterStatus(res){
    if(res.status == 200){
        return res;
    }else{
        const error = new Error();
        error.res = res;
        throw error;
    }
}

function filterJSON(res){
    return res.json();
}