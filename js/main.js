var Hello = {
    connection: null,
    log: function(msg){
        $("#log").append("<p>"+msg+"</p>");
    }

};

$(document).ready(function () {

});

var BOSH_HOST = "http://of3.hanlin.com.tw:7070";
var SHORT_HOST_NAME = "of3";
var LOGON_USER = "t002";
var LOGON_PWD = "t002";



function connect(){
    var jid_val = $("#jid").val();
    var pwd_val = $("#password").val();
    var conn = new Strophe.Connection(BOSH_HOST);
    conn.connect(LOGON_USER+"@"+SHORT_HOST_NAME, LOGON_PWD, function(status){
        Hello.log(status)
        if(status === Strophe.Status.CONNECTED){
            Hello.log("Connected...");
        }else if(status === Strophe.Status.DISCONNECTED){
            Hello.log("disconnected!!!");
        }else{
            alert(status.toString());
        }
    });
    Hello.connection = conn;
    var pres1 = $build("presence", {to: BOSH_HOST});
    var pres2 = $build("foo").c("bar").c("baz");
    var msg1 = $msg({to: LOGON_USER+"@"+SHORT_HOST_NAME, type: "chat"}).c("body").t("你好嗎？Miss you!").c("status").t("不是很好！！");
    var domain = Strophe.getDomainFromJid(LOGON_USER+"@"+SHORT_HOST_NAME);
    var ping = $iq({
        to: domain,
        type: "get",
        id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
    conn.send(ping);
    alert(domain);

}

function disconnect(){
    Hello.connection = null;
    Hello.log("disconnected!!!");
}

