// console.log("hello world!") 

// npm 이라는 module 사이트가 있음.
// npm install [모듈 이름] << 다운로드 명령어


// npm init
// npm install figlet

var figlet = require("figlet");

figlet("Courtney", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});