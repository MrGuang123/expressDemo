//定义一个数据数组
var fortuneCookies = [
    '战胜你的恐惧否则他们将战胜你',
    '河流需要泉水',
    '不要对位置感到恐惧',
    '你将会有一个意外的惊喜',
    '当有可能的时候，请保持简单'
];

exports.getFortune = function () {
    var index = Math.floor(Math.random() * fortuneCookies.length);
    return fortuneCookies[index];
}