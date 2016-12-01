/*使用的时候只需要require引入：var emailServer = require('./lib/email.js')(credentials) credentials是基本信息
 *emailServer.send('邮箱地址','标题','内容体');
*/


var nodemailer = require('nodemailer');

module.exports = function(credentials){
    var mailTransport = nodemailer.createTransport({
        service:'qq',
        auth:{
            user:credentials.qq.name,
            pass:credentials.qq.password
        }
    });

    var from = credentials.qq.name;
    var errorRecipient = credentials.qq.name;

    return {
        send:function(to,subj,body){
            mailTransport.sendMail({
                from:from,
                to:to,
                subject:subj,
                html:body,
                generateTextFromHtml:true
            },function(err){
                if(err){
                    console.error('unable to send email' + err);
                }
            });
        },
        emailError:function(message,filename,exception){
            var body = '<h1>商品信息有误</h1>'+'message:<br><pre>'+message+'</pre><br>';
            if(exception) body += 'exception:<br><pre>'+exception+'</pre><br>';
            if(filename) body+= 'filename:<br><pre>'+filename+'</pre><br>';

            mailTransport.sendMail({
                from:from,
                to:errorRecipient,
                subject:'商品信息有误',
                html:body,
                generateTextFromHtml:true
            },function(err){
                if(err) console.error('unable to send email:'+err)
            })
        }
    }

}