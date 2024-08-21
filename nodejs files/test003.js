const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send("hello world!")
})

app.get('/dog', (req, res) => {
    res.send("강아지")
})

app.get('/cat', (req, res)=> {
    res.send('고양이')
})

const key = 'shkwak'

app.get('/user/:id', (req, res) => {
    const q = req.params.id
    const p = req.params
    const k = req.query
    if(q === key)
    {
        console.log(p)
        res.send('confirmed')
        // if(k != 'null')
        // {
        //     console.log(k)
        // }
        // else
        // {
        //     console.log("nothing")
        // }
    }
    else{
        console.log(p)
        res.send('denied')
    }
})

app.listen(port)

// 주석 ctrl + /

