let xhr = new XMLHttpRequest();

let url = "https://reqbin.com/echo/get/json";

xhr.open("GET", url);

xhr.send();

xhr.onload = () => console.log(xhr.responseText);