var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
  const session = JSON.parse(fs.readFileSync('./session.json').toString())
  if (path === '/login' && method === 'POST') {
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    //读
    const userArray = JSON.parse(fs.readFileSync('./public/data.json'))
    console.log(userArray)
    const arr = []
    request.on('data', (chunk) => {
      arr.push(chunk)
    })
    request.on('end', () => {
      const obj = JSON.parse(Buffer.concat(arr).toString())
      console.log(obj)
      const user = userArray.find((item) => item.name === obj.name && item.password === obj.pwd)
      if (user === undefined) {
        response.statusCode = 400
        response.setHeader("Content-Type", "text/json; charset=utf-8");
      } else {
        response.statusCode = 200
        const random = Math.random()
        session[random] = { user_id: user.id }
        fs.writeFileSync('./session.json', JSON.stringify(session))
        response.setHeader("Set-Cookie", `session_id=${random}; HttpOnly`);
      }
      response.end()
    })
  } else if (path === '/home') {
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    const cookie = request.headers["cookie"]
    let session_id;
    try {
      session_id = cookie.split(';').filter(s => s.indexOf('session_id') >= 0)[0].split("=")[1]
    } catch (error) { }
    if (session_id && session[session_id]) {
      const user_id = session[session_id].user_id
      const userArray = JSON.parse(fs.readFileSync("./public/data.json"));
      const user = userArray.find(user => user.id === userId);
      const homeHtml = fs.readFileSync("./public/home.html").toString();
      let string = ''
      if (user) {
        string = homeHtml.replace("{{loginStatus}}", "已登录")
          .replace('{{user.name}}', user.name)
      }
      response.write(string)
    } else {
      const homeHtml = fs.readFileSync("./public/home.html").toString();
      const string = homeHtml.replace("{{loginStatus}}", "未登录")
        .replace('{{user.name}}', '')
      response.write(string)
    }
    response.end('home')
  } else if (path === '/register' && method === "POST") {
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    //读
    const userArray = JSON.parse(fs.readFileSync('./public/data.json'))
    const arr = []
    request.on('data', (chunk) => {
      arr.push(chunk)
    })
    request.on('end', () => {
      const obj = JSON.parse(Buffer.concat(arr).toString())
      const lastUser = userArray[userArray.length - 1]
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password
      }
      //写
      userArray.push(newUser)
      fs.writeFileSync('./public/data.json', JSON.stringify(userArray))
      response.end()
    })
  } else {
    response.statusCode = 200
    const requestPath = path === '/' ? 'index.html' : path
    console.log(requestPath)
    const index = path.indexOf('.')
    const suffix = requestPath.substring(index)
    const filetype = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      '.jpg': 'image/jepg',
      '.json': 'text/json',
    }
    response.setHeader('Content-Type', `${filetype[suffix] || 'text/html'};charset=utf-8`)
    let content
    try {
      content = fs.readFileSync(`./public/${requestPath}`)
    } catch (error) {
      content = '文件不存在,请重试'
      response.statusCode = 404
    }
    response.write(content)
    response.end()
  }



  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)