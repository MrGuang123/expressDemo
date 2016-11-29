var express = require('express');
var app = express();

//设置模板引擎
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main',
        //设置main页面的后缀名为.hbs
        extname: '.hbs'
    });
    //如果 要想所有的页面都是用.hbs结尾，这里还需要设置一下
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

//定义一个数据数组
var fortunes = [
    '战胜你的恐惧否则他们将战胜你',
    '河流需要泉水',
    '不要对位置感到恐惧',
    '你将会有一个意外的惊喜',
    '当有可能的时候，请保持简单'
]

//设置静态资源目录,static中间相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.render('home');
})

app.get('/about', function (req, res) {
    var randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)];
    res.render('about',{fortune:randomFortune});
})

app.use(function (err, req, res, next) {
    res.status(404);
    res.render('404');
})

app.use(function (err, req, res, next) {
    res.status(500);
    res.render('500');
})


app.listen(app.get('port'), function () {
    console.log('express started on http:localhost:' + app.get('port') + ';press ctrl+c to terminate.')
})