var cluster = require('cluster');
var cpus = require('os').cpus();
var count = 0;
console.log(cpus.length + ':' + count++)

//启动线程函数
function startWorker (){
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started',worker.id);
}

if(cluster.isMaster){
    cpus.forEach(function(){
        startWorker();
    })
    
    //记录所有断开的线程，如果工作线程断开了，他应该退出
    // 因此我们可以等待exit事件然后繁衍一个新的工作线程来代替他
    cluster.on('exit',function(worker,code,signal){
        console.log('CLUSTER: Worker %d died with exit code %d (%s)',worker.id,code,signal);
        startWorker();
    });
}else {
    //在这个工作线程上启动我们的应用服务器，
    require('./meadowlark.js')();
}

