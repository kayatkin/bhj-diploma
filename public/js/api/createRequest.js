/**
 * Основная функция для совершения запросов
 * на сервер.
 * */

const createRequest = (options = {}) => {
  const xhr = new XMLHttpRequest();
  let url = options.url;
  let formData = null;

  const method = options.method;
  const data = options.data || {};

  if (method === "GET") {
    url = url + "?";
    for (let key of Object.keys(data)) {
      const coupleData = `${key}=${data[key]}`;
      url = url + coupleData + "&";
    }
    url = url.slice(0, url.length - 1);
  } else {
    formData = new FormData();
    for (let item of Object.keys(data)) {
      formData.append(item, data[item]);
    }
  }
  xhr.responseType = "json";

  xhr.addEventListener("load", (e) => {
    try {
      typeof options.callback === "function" &&
        options.callback(null, xhr.response);
    } catch (e) {
      console.log(e, "Error during callback");
      typeof options.callback === "function" &&
        options.callback(`${xhr.status} ${xhr.statusText}`, xhr.response);
    }
  });
  try {
    xhr.open(method, url, true);
    xhr.send(formData);
  } catch (e) {
    console.log(e);
    typeof options.callback === "function" &&
      options.callback(options.err, null);
  }
  return xhr;
};
