var request = require('request')
var cheerio = require('cheerio')
var q       = require('q')
var j = request.jar();

var simquadrat = function(username, password){
    var username = username
    var password = password

    var crfstoken
    var phpsession
    var month
    
    this.evn = function(){
        return q.fcall(login)
        .then(getTable)
    }

    function login(){
        var deferred = q.defer();
        request({url: 'https://www.simquadrat.de/login', jar: j}, function(err, res, body){
            crfstoken = decodeURIComponent(j._jar.store.idx['www.simquadrat.de']['/'].csrftoken.value)
            request.post({url:'https://www.simquadrat.de/login', jar: j, form: {email: username, password: password, CSRFToken: crfstoken}}, function(err, res, body){
                phpsession = decodeURIComponent(j._jar.store.idx['www.simquadrat.de']['/'].PHPSESSID.value)
                deferred.resolve()
            })
        })
        return deferred.promise;
    }

    function getTable(){
        var deferred = q.defer();
        request.get({url:'https://www.simquadrat.de/account/itemized/0', jar: j}, function(err, res, body){
            $ = cheerio.load(body, {normalizeWhitespace: true, xmlMode: true, decodeEntities: false});
            var zeilen = []
            $('.items tbody > tr').each(function(){
                var data = []
                $("td", this).each(function(){
                    data.push($(this).text().replace(/\t/g, '').replace(/ /g, '').replace(/&nbsp;/g, ''));
                })
                zeilen.push(data)
            })
            zeilen = zeilen.slice(0, zeilen.length-2);
            var data = []
            var date = new Date();
            zeilen.forEach(function(elem, i){
                month = pad(date.getMonth(), 2)
                i = pad(i, 5);

                var element = {
                    id: date.getFullYear() + "" + month + "" + i,
                    time: elem[0],
                    device: elem[1],
                    number: elem[2],
                    duration: elem[3],
                    price: elem[4]
                };
                data.push(element);
            })
            deferred.resolve(data);
        })
    return deferred.promise;
    }
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

module.exports = simquadrat;