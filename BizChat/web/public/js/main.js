/**
 * Created by jimmy on 8/25/15.
 */

$(function(){
    $(roomlist).appendTo('.st_tree');
    var editor = new Simditor({
        textarea: $('#chat'),
        toolbar:['emoji','color', 'image'],
        emoji:{
            imagePath: 'public/img/emoji/'
        },
        upload:{
            url: '',
            params: null,
            fileKey: 'upload_file',
            connectionCount: 3,
            leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
        }
    });

    $('.right-side-tab').find('.tab').click(function(){
        $('.right-side-tab').find('.tab').attr('class','tab');
        $(this).addClass('active');
        $('.right-side-bottom').hide();
        $('.right-side-bottom').eq($(this).index()).show();
    });
    //$('.emotion').qqFace({
    //    id : 'facebox',
    //    assign:'chat',
    //    path:'public/img/emotion/'	//表情存放的路径
    //});


    $(".st_tree").SimpleTree({
        /* 可无视代码部分*/
        click:function(a){
            if(!$(a).attr("hasChild"))
                alert($(a).attr("ref"));
        }
    });

    drag('.title-bar');
    closeDialog();
    bindResize(document.getElementById('resize'));
    miniSize();
    openDialog();
    maxSize();
    var Chat = {};
    Chat.socket = null;
    Chat.connect = function(host) {
        if ('WebSocket' in window) {
            Chat.socket = new WebSocket(host);
        } else if ('MozWebSocket' in window) {
            Chat.socket = new MozWebSocket(host);
        } else {
            Console.log('提示: 你的浏览器不支持WebSocket通讯.');
            return;
        }
        //客户端
        Chat.socket.onopen = function (message) {
            Console.tip('连通状态');
            $('.simditor-body').keydown(function(){
                if (event.keyCode == 13) {
                    Chat.sendMessage();
                    editor.setValue('');
                }
            })
            $(".sub_btn").on("click", function () {
                Chat.sendMessage();
                editor.setValue('');
            })
        };
        //客户端
        Chat.socket.onclose = function (message) {
            document.getElementById('chat').onkeydown = null;
            Console.tip('提示: 通讯端口关闭.');
        };

        var userlist=[];
        //服务器端
        Chat.socket.onmessage = function (message) {
            if(message.data.indexOf("*ULGNN") >= 0){
                $('#chat-body').data('uid',message.data.substring(7,message.data.length).trim());  
            }else if(message.data.indexOf("*ULIST") >= 0){
                var jsonStr = message.data.substring(7,message.data.length); 
                var rfc = eval("("+jsonStr+")");
                userlist = rfc;
                //var rfc = eval("("+message.data+")");

                //userlist.push(rfc);
                $('.user-list').html('');
                for(var i=0;i<rfc.length;i++){
                    Console.list(rfc[i].name,rfc[i].info);
                }                           
            }else if( message.data.indexOf("*UJOIN") >= 0 ){
                jsonStr = message.data.substring(7,message.data.length);
                rfc = eval("("+jsonStr+")");
                userlist =userlist.concat(rfc);

                $('.user-list').html('');
                for(var i=0;i<userlist.length;i++){
                    Console.list(userlist[i].name,userlist[i].info);
                }                 
            }else if( message.data.indexOf("*URMVD") >= 0 ){
                var username = message.data.substring(7,message.data.length);
                Console.log(username, 'info');
            /* for(var k=0;k<userlist.length;k++){
                    if(userlist[k].name.trim() == username.trim()){
                        alert(k);
                        break;
                    }
                } 
                //Console.tip(userlist[k].name+'刚离开房间');                    
                userlist = userlist.splice(k);  
                //$('.user-list').html('');
                for(var i=0;i<userlist.length;i++){
                    Console.list(userlist[i].name,userlist[i].info);
            }   */                          
            }else{
                var data = eval("("+message.data+")");
                //alert(data.userMessage);
                if($('#chat-body').data('uid')==data.userMessage){
                    Console.log(data.message,'my');
                }else{
                    Console.log(data.message, 'other');
                }                    
            }
        }
    };
   

    Chat.initialize = function() {
        if (window.location.protocol == 'http:') {
            Chat.connect('ws://' + window.location.host + '/BizChat/chat');
        //Chat.connect('ws://http://139.227.229.44:8080/BizChat/chat');
        //Chat.connect('ws://139.227.229.44:8080/BizChat/chat');
        } else {
            Chat.connect('wss://' + window.location.host + '/BizChat/chat');
        }
    };

    Chat.sendMessage = function() {
        var message = editor.getValue();
        if (message != '') {
            Chat.socket.send(message);
        }
    };

    var Console = {};
    Console.log = function(message,type) {
        if(type=='my'){
            $('<li class="my-chat" style="break-word">'+htmlDecode(message)+'</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        }else if(type=='other'){
            $('<li class="other-chat" style="break-word">'+htmlDecode(message)+'</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        }else if(type=='info'){
            $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong>'+message+ '</strong></span>&nbsp刚离开了房间</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        }
    };

    Console.list=function(tip,info){
        $('<li><div class="avatar-left"><img src="public/img/avatar.png" width="32" height="32"></div><div class="info"><p>'+tip+'</p><p>'+info+'</p></div></li>').appendTo('.user-list')
    //$(".user-list li").on("click", function () {
    //    $(".active-state").text("与 "+$(this).children(".info").children("p:first").text() + " 聊天中...")
    //})
    };
    Console.tip=function(tip){
        $('<div class="clear-both"></div><p class="tip">'+tip+'</p>').appendTo('#console')
    };
    Chat.initialize();
});

//Html解码获取Html实体
function htmlDecode(value){
    return $('<div/>').html(value).text();
}

//拖动
function drag(el){
    var disX=0;
    var disY=0;
    $(el).mousedown(function(ev){
        disX=ev.pageX-$(this).offset().left;
        disY=ev.pageY-$(this).offset().top;
        var _this=$(this).parent();
        $(document).mousemove(function(ev){
            $(_this).css('left',ev.pageX-disX);
            $(_this).css('top',ev.pageY-disY);
        });
        $(document).mouseup(function(){
            //取消事件
            $(document).off()
        })
    });
    //取消默认事件
    return false;
}

//插入表情


//聊天框大小调整
function bindResize(el){
    var els = el.style,
    x = y = 0;
    $(el).mousedown(function(e){
        x = e.clientX - el.parentNode.offsetWidth,
        y = e.clientY - el.parentNode.offsetHeight;
        el.setCapture ? (
            el.setCapture(),
            //设置事件
            el.onmousemove = function(ev){
                mouseMove(ev || event)
            },
            el.onmouseup = mouseUp
            ) : (
            $(document).bind("mousemove",mouseMove).bind("mouseup",mouseUp)
            );
        e.preventDefault()
    });
    function mouseMove(e){
        el.parentNode.style.width = e.clientX - x + 'px',
        el.parentNode.style.height = e.clientY - y + 'px'
    }
    function mouseUp(){
        el.releaseCapture ? (
            el.releaseCapture(),
            el.onmousemove = el.onmouseup = null
            ) : (
            $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
            )
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Remove elements with "noscript" class - <noscript> is not allowed in XHTML
    var noscripts = document.getElementsByClassName("noscript");
    for (var i = 0; i < noscripts.length; i++) {
        noscripts[i].parentNode.removeChild(noscripts[i]);
    }
}, false);

function miniSize(){
    $('.fa-minus').click(function(){
        $('.right-content').hide();
        $('.left-content').hide();
        $('.resize').hide();
        $('.chat-wrapper').css('height','auto');
        $('.chat-wrapper').css('min-height','0px');
        $(this).removeClass('fa-minus');
        $(this).addClass('fa-square-o');
        reinstate();
    })
}

function reinstate(){
    $('.fa-square-o').click(function(){
        $('.chat-wrapper').css('height','533px');
        $('.chat-wrapper').css('min-height','500px');
        $('.right-content').show();
        $('.left-content').show();
        $('.resize').show();
        $(this).removeClass('fa-square-o');
        $(this).addClass('fa-minus');
        miniSize()
    })
}

function maxSize(){
    $('.fa-plus').click(function(){
        $('.chat-wrapper').css('height',$(window).height()+"px");
        $('.chat-wrapper').css('width',$(window).width()+"px");
        $('.chat-wrapper').css('top','0px');
        $('.chat-wrapper').css('left','0px');
    })
}

function closeDialog(){
    $('.fa-remove').click(function(){
        $('.chat-wrapper').hide();
    });
}
function openDialog(){
    $('.chat-open').click(function(){
        $('.chat-wrapper').show();
    });
}

$(function () {
    $("#cert").click(function () {
        $(this).parent().siblings("ul").toggleClass("hover");
    })
    $(".bottom-send ul>li").on("click", function () {
        $(".ss_text").text($(this).text());
        $(".bottom-send ul").removeClass("hover");
    })
})