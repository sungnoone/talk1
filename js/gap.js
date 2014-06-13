/**
 * Created by hl on 2014/5/26.
 */

var BOSH_HOST = "http://of3.hanlin.com.tw:7070/http-bind/";
var SHORT_HOST_NAME = "of3";
var LOGON_USER = "t002";
var LOGON_PWD = "t002";

var Gab = {
    connection: null,
    connected:false,
    receiver:""
};

$(document).ready(function () {

});


/*==============================================*/

//設定
{

    //Connect Server
    function btn_connect(){
        var conn = new Strophe.Connection(BOSH_HOST);

        conn.xmlInput = function(body){
            showTraffic(body, "incoming");
        };
        conn.xmlOutput = function(body){
            showTraffic(body, "outgoing");
        };

        conn.connect(LOGON_USER+"@"+SHORT_HOST_NAME, LOGON_PWD, function (status) {
            if(status === Strophe.Status.CONNECTED) {
                $("#message").append("<p>Connected!!!</p>");
                conn.addHandler(handle_message,null,"message",'chat');
                conn.send($pres());
                Gab.connected = true;
            }else if(status === Strophe.Status.CONNECTING){
                $("#message").append("<p>Connecting!!!</p>");
            }else if(status === Strophe.Status.DISCONNECTED) {
                $("#message").append("<p>Disconnected!!!</p>");
                Gab.connected = false;
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
        Gab.connection = conn;
    }

//Disconnect Server
    function btn_disconnect(){
        Gab.connection.disconnect();
        Gab.connected = false;
    }

//Send Data
    function btn_send(){
        var input = $("#input").val();
        var error = false;
        if(input.length>0){
            if(input[0]==="<"){
                var xml = textToXml(input);
                if(xml){
                    Gab.connection.send(xml);
                }else{
                    error = true;
                }
            }else if(input[0]==="$"){
                try{
                    var builder = eval(input);
                    Gab.connection.send(builder);
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

//Clear message
    function btn_clear_msg(){
        $("#console").empty();
        $("#message").empty();
    }


    //註冊帳號
    function btn_register_user(){
        var register_type = "add";
        var register_secret = "sfj4tIuL";
        var register_username = "t031";
        var register_password = "t031";
        var register_name = "阿星31號";
        var register_email = "";
        var register_groups = "";
        var register_item_jid = "";
        var register_subscription = "";

        var register_url = "http://of3.hanlin.com.tw:9090/plugins/userService/userservice?type="+register_type+"&secret="+register_secret+"&username="+register_username+"&password="+register_password+"&name="+register_name;
        $.ajax({
            url:register_url,
            data:"",
            type:"GET",
            success:function(resp){
                alert(resp);
            },
            error:function(e){
                alert("Error:"+e);
            },
            dataType:"jsonp"
        });


/*        var result = $.ajax({
            url:register_url,
            data:"",
            success:onSuccess(),
            dataType:xml
        });
        alert(result);*/
/*        $.get(register_url, function(){
            //alert(data);
            alert("OK");
        });*/

        //window.location.href = register_url;
        /*$.ajax({
         type:"GET",
         url:register_url,
         cache:false,
         success:function(msg){
         //$("#tab3_1").html(msg);
         alert(msg);
         }
         });*/
       /* $.getJSON(register_url, function(data){
            alert(data);
        });*/



    }

    function onSuccess(){
        alert("ok");
    }



}//設定


//Dig
{
    //disco#info
    function on_query_service_info(iq, elem){
        if(Gab.connected === false){
            $("#info_list").append("<p>伺服器未連線...</p>");
            return false;
        }
        var query_attrs = {};
        query_attrs["xmlns"] = "http://jabber.org/protocol/disco#info";

        Gab.connection.sendIQ($iq({to:"of3",type:"get"}).c("query", query_attrs), function(iq, elem){
            $("#info_list").empty();
            $("#info_list").append("<ul id='info_identity'>identity</ul>");
            $(iq).find("identity").each(function(){
                $("#info_identity").append("<li>"+$(this).attr("type")+":"+$(this).attr("category")+"</li>");
            });
            $("#info_list").append("<ul id='info_feature'>feature</ul>");
            $(iq).find("feature").each(function(){
                $("#info_feature").append("<li>"+$(this).attr("var")+"</li>");
            });
        })
    }

    //disco#item
    function on_query_service_item(iq, elem){
        if(Gab.connected === false){
            $("#item_list").append("<p>伺服器未連線...</p>");
            return false;
        }
        var query_attrs = {};
        query_attrs["xmlns"] = "http://jabber.org/protocol/disco#items";
        Gab.connection.sendIQ($iq({to:"of3",type:"get"}).c("query", query_attrs), function(iq, elem){
            $("#item_list").empty();
            $("#item_list").append("<ul id='items'></ul>");
            $(iq).find("item").each(function(){
                $("#items").append("<li>"+$(this).attr("jid")+":"+$(this).attr("name")+"</li>");
            });
        })
    }

}

//通用
{

    //Show Traffic
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

    //xml string to html
    function xml2html(str){
        //alert("Running xml2html...");
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    //Convert text to xml for input
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

    //Handler receiving message
    function handle_message(message){
//        if ($(message).attr("from").match(/^t004@of3/)) {
//            var body = $(message).children("body").text();
//            $("#chat-area").prepend("<p>"+body+"</p>");
//        }
        var from = $(message).attr("from");
        var body = $(message).children("body").text();
        $("#chat-area").prepend("<p>("+from+"): "+body+"</p>");
        //$("#chat-area").prepend("<p>"+body+"</p>");
        return true;
    }

    //change page(無用留存)
    function page_change(page_url){
        $(location).attr("href", page_url);
    }


}


//通訊錄
{


    //取得通訊錄
    function btn_get_contact(){
        $("#contact_ul").empty();
        if (Gab.connected === false){
            $("#contact_ul").append("<p>主機未連線...</p>");
            return false;
        }
        var iq = $iq({type:"get"}).c("query", {xmlns:"jabber:iq:roster"});
        Gab.connection.sendIQ(iq, on_roster, err_roster);

    }

    //通訊錄成功處理
    function on_roster(iq){
        $(iq).find("item").each(function(){
            var jid = $(this).attr("jid");
            var name = $(this).attr("name");
            $("#contact_ul").append("<li><a onclick='choose_receiver(\""+jid+"\");\'>"+name+":"+jid+"</a></li>");
        });
        $("#contact_ul").listview("refresh");
    }

    //通訊錄失敗處理
    function err_roster(e){
        //alert(e.toString());
        $("#contact_ul").append("<p>通訊錄取得失敗...</p>");
    }

    //選擇通訊對象
    function choose_receiver(jid){
        //alert(jid);
        var jid_ary = jid.split("@");
        if(jid_ary.length > 1){
            Gab.receiver = jid;
        }else if(jid_ary.length === 1){
            Gab.receiver = jid+"@"+SHORT_HOST_NAME;
        }else{
            Gab.receiver = LOGON_USER+"@"+SHORT_HOST_NAME;
        }

        $("#chat-title").empty();
        $("#chat-title").append("<p>目前聊天對象:"+Gab.receiver+"</p>");
        $("#li_tab1").trigger("click");
    }


}

//聊天
{

    //送出訊息
    function chat_send(){
        var input = $("#chat_input").val();
        if(input.length<=0){
            return false;
        }
        if(Gab.connected === false){
            try{
                btn_connect();//自動連線
            }catch (e){
                $("#chat-msg").append("<p>伺服器連線失敗！無法傳送訊息..."+ e.toString()+"</p>");
                return false;
            }
        }

        var msg = "$msg({to: '"+Gab.receiver+"', type: 'chat'}).c('body').t('"+input+"')";
        try{
            var currentdate = new Date();
            Gab.connection.send(eval(msg));
            $("#chat-area").prepend("<p>"+currentdate+"("+LOGON_USER+"): "+input+"</p>");
        }catch (e){
            $("#chat-msg").append("<p>"+ e.toString()+"</p>");
        }




    }





}