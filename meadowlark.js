var express = require('express');
var app = express();
var http = require('http');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var cookieParse = require('cookie-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');
var credentials = require('./credentials.js');
var morgan = require('morgan');
var logger = require('express-logger');
//加入bodyParser中间件，处理post请求的请求体，这时req的body变为可用
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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


//检测是生产模式还是开发模式，开发模式使用mogan输出彩色日志，如果是生产环境使用express-logger生成日志
switch(app.get('env')){
    case 'development':
        app.use(morgan('dev'));
        break;
    case 'production':
        app.use(logger({
            path:__dirname+'/log/requests.log'
        }))
}

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

//设置邮箱,英国测试邮件发送成功
var mailTransport = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: credentials.qq.name,
        pass: credentials.qq.password,
    }
});

/*var mailOption = {
    from: '522125842@qq.com',
    to: 'ytg@jusfoun.com',
    subject: 'node测试邮件',
    // text:'hello world node test',  一般默认选择显示html
    html: `<h2>node测试邮件</h2><p>如果成功说明弄得邮件测试成功</p>`,
    // 将html转换成为text文本
    generateTextFromHtml: true
};

mailTransport.sendMail(mailOption,function(err){
    if(err) console.error('邮件发送失败，因为' + err);
    else console.log('发送成功')
})*/

//设置文件上传配置,需要下载几个插件，没有下载，暂时不想做，以后再说
/*app.use('/upload',function(req,res,next){
    var now = new Date();
    jqupload.fileHandler({
        uploadDir:function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl:function(){
            return '/uploads' + now;
        }
    })(req,res,next);
});

//使用cookie中间件
app.use(cookieParse());
// app.use(session());

//提供一个API
var tours = [
    { id: 0, name: 'hood river', price: 99.99 },
    { id: 1, name: 'oregon coast', price: 149.95 }
]

/*app.get('/api/tours',function(req,res){
    res.json(tours);
})*/

//设置静态资源目录,static中间相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));

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

//设置即显消息
/*app.use(function(req,res,next){
    //如果有即显消息，把他传到上下文中，然后清除他
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
})*/


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

app.get('/newsletter', function (req, res) {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
})

/*app.post('/newsletter',function(req,res){
    var name = req.body.name || '',email = req.body.email || '';
    //输入验证
    if(!email.match(VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json({error:'Invalid name email address.'})

        req.session.flash = {
            type:'danger',
            intro:'Validation error',
            message:'The email address you entered was not valid',
        }

        return res.redirect(303,'/newsletter/archive');
    }

    new NewsletterSignup({name:name,email:email}).save(function(err){
        if(err){
            if(req.xhr) return res.json({error:'Database error'});

            req.session.flash = {
                type:'danger',
                intro:'Database Error',
                message : 'There was a database error; please try again later',
            }

            return res.redirect(303,'/newsletter/archive');
        }

        if(req.xhr) return res.json({success:true});

        req.session.flash = {
            type:'success',
            intro:'Thank you',
            message:'You have now been signed up for the newsletter',
        }

        return res.redirect(303,'/newsletter/archive');
    })
})*/

app.get('/error', function (req, res) {
    res.render('error');
})

app.get('/contest/vacation-photo', function (req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    })
})

//发送邮件的post请求，给邮件添加了html模板
app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields :');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    })
})

app.post('/cart/checkout', function (req, res) {
    var cart =  {};
    if (!cart) next(new Error('Cart does not exist.'));

    var name = req.body.name || '', email = req.body.email || '';

    //输入验证
    /*if (!email.match(VALID_EMAIL_REGEX))
        res.next(new Error('Invalid email address.'));*/

    //分配一个随机的购物车id，一般我们会用一个数据库id
    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name: name,
        email: email
    };

    res.render('email/cart-thank-you', { layout: null, cart: cart }, function (err, html) {
        if (err) console.log('error in email template');

        var mailOption = {
            from: '522125842@qq.com',
            to: 'ytg@jusfoun.com',
            subject: 'node测试邮件',
            html: html,
            generateTextFromHtml: true
        };

        mailTransport.sendMail(mailOption, function (err) {
            if (err) console.error('邮件发送失败，因为' + err);
            else console.log('发送成功')
        })
    })

    res.render('cart-thank-you', { cart: cart });
})

/*//直接表单提交的处理方法
app.post('/process',function(req,res){
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field)' + req.body._csrf);
    console.log('Name (from visible form field)' + req.body.name);
    console.log('Email (from visible form field)' + req.body.email);
    res.redirect(303,'/thank-you');
})*/

//用ajax使用post提交的处理方法
app.post('/process', function (req, res) {
    res.json({ success: true });
    // if(req.xhr || req.accepts('json,html') === 'json'){
    //     res.send({success:true});
    // }else {
    //     res.redirect(303,'/thank-you')
    // }
})

app.get('/thank-you', function (req, res) {
    res.render('thank-you', { layout: null });
})

app.use(function (err, req, res, next) {
    res.status(500);
    res.render('500');
})

app.use(function (err, req, res, next) {
    res.status(404);
    res.render('404');
})

//启动服务方法
function startServer(){
    http.createServer(app).listen(app.get('port'),function(){
        console.log('express started on http:localhost:' + app.get('port') + ';press ctrl+c to terminate.');
    })
}
/*app.listen(app.get('port'), function () {
    console.log('express started on http:localhost:' + app.get('port') + ';press ctrl+c to terminate.')
})*/

if(require.main === module){
    //应用程序直接执行，启动应用服务器
    startServer();
}else {
    //应用程序作为一个模块可以通过require引入，然后创建服务器
    module.exports = startServer;
}