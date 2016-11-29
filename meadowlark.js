var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');

//设置模板引擎
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main',
        //设置main页面的后缀名为.hbs
        extname: '.hbs',
        //添加一个叫section的辅助方法，可以插入网页任意位置的片段，不用担心依赖
        helpers: {
            section: function (name, options) {
                if (!this._section) this._section = {};
                this._section[name] = options.fn(this);
                return null;
            }
        }
    });
//如果 要想所有的页面都是用.hbs结尾，这里还需要设置一下
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

//模拟返回天气数据方法
function getWeatherData() {
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ]
    }
}

//给天气添加一个中间件
app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
})


//设置静态资源目录,static中间相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));

//提供一个API
var tours = [
    { id: 0, name: 'hood river', price: 99.99 },
    { id: 1, name: 'oregon coast', price: 149.95 }
]

/*app.get('/api/tours',function(req,res){
    res.json(tours);
})*/

app.get('/api/tours', function (req, res) {
    var toursXml = '<?xml version="1.0"?><tours>' +
        tours.map(function (p) {
            return '<tour price="' + p.price + '" id="' + p.id + '">' + p.name + '</tour>';
        }).join('') + '</tours>';

    var tourText = tours.map(function (p) {
        return p.id + ':' + p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json': function () {
            res.json(tours);
        },
        'application/xml': function () {
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function () {
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function () {
            res.type('text/plain');
            res.send(toursXml);
        }
    })
})

//设置端口
app.set('port', process.env.PORT || 3000);

//设置路由
app.get('/', function (req, res) {
    res.render('home');
})

app.get('/about', function (req, res) {
    res.render('about', { fortune: fortune.getFortune() });
})

app.get('/headers', function (req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) {
        s += name + ':' + req.headers[name] + '\n';
    }
    res.send(s);
})

app.get('/jquerytest', function (req, res) {
    res.render('jquerytest')
})

app.get('/nursery-rhyme', function (req, res) {
    res.render('nursery-rhyme');
})

app.get('/data/nursery-rhyme', function (req, res) {
    res.json({
        animal: '121',
        bodyPart: '121',
        adjective: '121',
        noun: 'a 121'
    })
})

app.use(function (err, req, res, next) {
    res.status(500);
    res.render('500');
})

app.use(function (err, req, res, next) {
    res.status(404);
    res.render('404');
})


app.listen(app.get('port'), function () {
    console.log('express started on http:localhost:' + app.get('port') + ';press ctrl+c to terminate.')
})