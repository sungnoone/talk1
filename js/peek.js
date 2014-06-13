/**
 * Created by hl on 2014/5/21.
 */

var Peek = {
        connection:null,
        start_time:null
    };

var BOSH_HOST = "http://of3.hanlin.com.tw:7070/http-bind/";
var SHORT_HOST_NAME = "of3";
var LOGON_USER = "t002";
var LOGON_PWD = "t002";

$(document).ready(function () {

});


function btn_connect(){

    var conn = new Strophe.Connection(BOSH_HOST);
    conn.xmlInput = function(body){
        //Peek.show_traffic(body, "incoming");
        showTraffic(body, "incoming");
    };
    conn.xmlOutput = function(body){
        //Peek.show_traffic(body, "outgoing");
        showTraffic(body, "outgoing");
    };

    conn.connect(LOGON_USER+"@"+SHORT_HOST_NAME, LOGON_PWD, function(status){
        if(status === Strophe.Status.CONNECTED) {
            //$("#disconnect_button").removeAttr("disabled");
            $("#message").append("<p>Connected!!!</p>");
        }else if(status === Strophe.Status.CONNECTING){
            $("#message").append("<p>Connecting!!!</p>");
        }else if(status === Strophe.Status.DISCONNECTED) {
            //$("#disconnect_button").removeAttr("disabled");
            $("#message").append("<p>Disconnected!!!</p>");
        }else if(status === Strophe.Status.DISCONNECTING) {
            $("#message").append("<p>Disconnecting!!!</p>");
        }else if(status === Strophe.Status.AUTHENTICATING){
            $("#message").append("<p>Authenticating!!!</p>");
        }else if(status === Strophe.Status.AUTHFAIL){
            $("#message").append("<p>Auth fail!!!</p>");
        }else if(status === Strophe.Status.ERROR){
            $("#message").append("<p>An error has occurred</p>");
        }else if(status === Strophe.Status.ATTACHED){
            $("#message").append("<p>The connection has been attached</p>");
        }else if(status === Strophe.Status.CONNFAIL){
            $("#message").append("<p>Connection fail!!!</p>");
        }else{
            $("#message").append("<p>Status:"+status+"</p>");
        }
    });
    Peek.connection = conn;
}

function btn_disconnect(){
    Peek.connection.disconnect();
}

function btn_send(){
    var input = $("#input").val();
    var error = false;
    if(input.length>0){
        if(input[0]==="<"){
            var xml = textToXml(input);
            if(xml){
                Peek.connection.send(xml);
            }else{
                error = true;
            }
        }else if(input[0]==="$"){
            try{
                var builder = eval(input);
                Peek.connection.send(builder);
                $("#message").append("<p>Send OK!</p>");
            }catch (e){
                console.log(e);
                error = true;
            }
        }else{
            error = true;
        }
    }
    if(error){
        $("#input").animate({backgroundColor:"#faa"});
    }
}

/*====================================*/

function showTraffic(body, type){
    if(body.childNodes.length>0){
        var console = $("#console").get(0);
        var at_bottom = console.scrollTop >= console.scrollHeight - console.clientHeight;;
        var i = 0;
        $.each(body.childNodes, function(){
            //$("#console").append("<h1>"+i+"</h1></br>");
            //$("#console").append(this.localName+ "</br>" + this.textContent +"</br>");
            //i+=1;
            //$("#console").append("<div>"+Peek.xml2html(Strophe.serialize(this))+"</div>");
            $("#console").append("<div class='"+type+"'>"+xml2html(Strophe.serialize(this))+"</div>");
        });
        if(at_bottom){
            console.scrollTop = console.scrollHeight;
        }
    };
}

function xml2html(str){
    //alert("Running xml2html...");
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textToXml(text){
    var doc = null;
    if(window['DOMParser']){
        var parser = new DOMParser();
        doc = parser.parseFromString(text, "text/xml")
    }else if(window['ActiveXObject']){
        var doc = new ActiveXObject("MSXML2.DOMDocument");
        doc.async = false;
        doc.loadXML(text);
    }else{
        throw {
            type:"PeekError",
            message:"No DOMParser object found."
        };
    }
    var elem = doc.documentElement;
    if($(elem).filter("parsererror").length>0){
        return null;
    }
    return elem;
}

//
function btn_clear_msg(){
    $("#console").empty();
    $("#message").empty();

}

//
function pretty_xml(xml, level){
    var i,j;
    var result = [];
    if(!level){
        level = 0;
    }
    result.push("<div class='xml_level" + level + "'>");
    result.push("<span class='xml_punc'>&lt;</span>");
    result.push("<span class='xml_tag'>");
    result.push(xml.tagName);
    result.push("</span>");
    // attributes
    var attrs = xml.attributes;
    var attr_lead = []
    for (i = 0; i < xml.tagName.length + 1; i++) {
        attr_lead.push("&nbsp;");
    }
    attr_lead = attr_lead.join("");
    for (i = 0; i < attrs.length; i++) {
        result.push(" <span class='xml_aname'>");
        result.push(attrs[i].nodeName);
        result.push("</span><span class='xml_punc'>='</span>");
        result.push("<span class='xml_avalue'>");
        result.push(attrs[i].nodeValue);
        result.push("</span><span class='xml_punc'>'</span>");
        if (i !== attrs.length - 1) {
            result.push("</div><div class='xml_level" + level + "'>");
            result.push(attr_lead);
        }
    }
    if (xml.childNodes.length === 0) {
        result.push("<span class='xml_punc'>/&gt;</span></div>");
    } else {
        result.push("<span class='xml_punc'>&gt;</span></div>");
        // children
        $.each(xml.childNodes, function () {
            if (this.nodeType === 1) {
                result.push(pretty_xml(this, level + 1));
            } else if (this.nodeType === 3) {
                result.push("<div class='xml_text xml_level" +
                    (level + 1) + "'>");
                result.push(this.nodeValue);
                result.push("</div>");
            }
        });
        result.push("<div class='xml xml_level" + level + "'>");
        result.push("<span class='xml_punc'>&lt;/</span>");
        result.push("<span class='xml_tag'>");
        result.push(xml.tagName);
        result.push("</span>");
        result.push("<span class='xml_punc'>&gt;</span></div>");
    }
    return result.join("");
}

function send_ping(to){
    var ping = $iq({
        to: to,
        type: "get",
        id: "ping1"}).c("ping", {xmlns: "urn:xmpp:ping"});
    Hello.log("Sending ping to " + to + ".");
    Hello.start_time = (new Date()).getTime();
    Hello.connection.send(ping);
}

function handle_pong(iq){
    var elapsed = (new Date()).getTime() - Hello.start_time;
    $("#message").append("<p>Received pong from server in :"+elapsed+" ms.</p>");
    Hello.connection.disconnect();
    return false;
}