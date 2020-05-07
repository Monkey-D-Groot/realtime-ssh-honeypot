var host = "ws://yourserverhere:yourporthere";

var myApp = angular.module('attackerApp',[]);

var attackOriginCountries = {};
var attackDestinations = {};
var topSrcIp = {};
var Usernames = {};
var topPassword = [];
var topIp = [];
var topCountry = [];
var topUsername = [];
var hashtable = {};
var myHistory = new Array();

myApp.factory('websocketService', function(){
    return {
        start: function(host, callback){
            var ws = new ReconnectingWebSocket(host);
            ws.onopen = function(){
            }
            ws.onmessage = function(message){
                var data = JSON.parse(message.data);
                topCountry = data.top_countries;
                topPassword = data.top_passwords;
                topIp = data.top_ips;
                topUsername = data.top_usernames;
                for(var i = 0; i < topCountry.length; i++){
                    var obj = topCountry[i];
                    attackOriginCountries[obj['country']] = obj['count'];
                }
                for(i = 0; i < topUsername.length; i++){
                    var obj3 = topUsername[i];
                    Usernames[obj3['username']] = obj3['count'];
                }
                for(i = 0; i < topPassword.length; i++){
                    var obj2 = topPassword[i];
                    attackDestinations[obj2['password']] = obj2['count'];
                }
                for(i = 0; i < topIp.length; i++){
                    var obj4 = topIp[i];
                    topSrcIp[obj4['ip']] = obj4['count'];
                }
                if(hashtable[data.hash]){
                    if (Object.keys(hashtable).length >= 7){
                        hashtable = {};
                        hashtable[data.hash] = 1;
                    }else{
                        var a;
                    }
                }else{
                    hashtable[data.hash] = 1;
                    callback(data);
                    if (myHistory.length > 7){
                        myHistory = myHistory.slice(1, myHistory.length);
                    }
                    myHistory.push(data);
                }
                for(i = 0; i < myHistory.length; i++){
                    data1 = myHistory[i];
                    var startLoc = [data1.attackerLatitude, data1.attackerLongitude];
                    var endLoc = [data1.targetLatitude, data1.targetLongitude];
                    var color = 'rgba(123, 239, 178, 1)';//'rgba(255, 255, 0, .75)';
                    drawLine(startLoc, endLoc, color, data1.attackerCity);
                }
            }
        }
    }


})

function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}

myApp.controller('tableController', ['$scope', 'websocketService', function($scope, websocketService) {
    $scope.attacks = [];
    $scope.getKeys = function(obj){
        return Object.keys(obj);
    }
    var maxAttackers = 7;



    $scope.getAttackRowStyle = function(attack){
        var returnColor = (attack.severity === "Informational") ? "#A8F000" : (attack.severity === "Notice" ? "#FFFF00" : (attack.severity === "Warning" ? "#FFB300" : (attack.severity === "Error" ? "#FF7400" : (attack.severity === "Critical" ? "#FF1800" : "#C9007A"))));
        return {"background-color" : convertHex(returnColor, 15)}
    }

    var updateAttackers = function(attack){
        if($scope.attacks.length > maxAttackers) {
            $scope.attacks = $scope.attacks.slice(1, $scope.attacks.length);
        }
        $scope.topDestinations = [];
        $scope.topSourceCountries = [];
        $scope.topSourceIps = [];
        $scope.topUsernames = [];
        for(var key in attackDestinations){
            var obj = {};
            obj[key] = attackDestinations[key];
            $scope.topDestinations.push(obj);
        }
        for(key in attackOriginCountries){
            var obj1 = {};
            obj1[key] = attackOriginCountries[key];
            $scope.topSourceCountries.push(obj1);
        }
        for(key in topSrcIp){
            var obj2 = {};
            obj2[key] = topSrcIp[key];
            $scope.topSourceIps.push(obj2);
        }
        for(key in Usernames){
            var obj3 = {};
            obj3[key] = Usernames[key];
            $scope.topUsernames.push(obj3);
        }
        
        $scope.topDestinations = $scope.topDestinations.sort(function(a, b){return -a[Object.keys(a)[0]] + b[Object.keys(b)[0]]}).slice(0,5);
        $scope.topSourceCountries = $scope.topSourceCountries.sort(function(a, b){return -a[Object.keys(a)[0]] + b[Object.keys(b)[0]]}).slice(0,5);
        $scope.topSourceIps = $scope.topSourceIps.sort(function(a, b){return -a[Object.keys(a)[0]] + b[Object.keys(b)[0]]}).slice(0,5);
        $scope.topUsernames = $scope.topUsernames.sort(function(a, b){return -a[Object.keys(a)[0]] + b[Object.keys(b)[0]]}).slice(0,5);
        $scope.attacks.push(attack);
        $scope.$apply();
    }
    websocketService.start(host,updateAttackers);
}]);

