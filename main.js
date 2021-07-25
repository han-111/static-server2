const fs = require('fs')
const string = fs.readFileSync('./public/data.json').toString()
const data = JSON.parse(string)
// console.log(string)
// console.log(data instanceof Array)
//以上为都数据库
//写数据库
const ueser = {
    "id": 1,
    "name": "韩晨曦",
    "damage": "123"
}
data.push(ueser)
const writefs = JSON.stringify(data)
fs.writeFileSync('./public/data.json', writefs)
console.log(data)

