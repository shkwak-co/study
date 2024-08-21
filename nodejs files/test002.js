// Express
// node.js를 활용하여 web 프로젝트

const express = require('express')
const app = express()

// app.get(라우팅, 콜백함수{동작})
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)