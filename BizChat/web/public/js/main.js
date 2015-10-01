/**
 * Created by jimmy on 8/25/15.
 */

$(function () {
    //$(roomlist).appendTo('.st_tree');
    /* $.ajax({
     url:"contents",
     success: function (data) {
     var roomlist = data + '</ul>';
     $(roomlist).appendTo('.st_tree');
     ///$(".st_tree").html(roomList);                          
     }
     })
     
     $.get("contents", {
     //"type" : rooms
     }, function(data) {
     setTimeout(function () {
     var roomMeta = data + '</ul>;';
     if(roomMeta.length > 30){             
     $(roomMeta).appendTo('.st_tree');
     $(".tree a").on("click", function () {
     $(".tip").text($(this).text())
     })
     }
     },1000);
     //$('.st_tree').html(roomMeta);
     });*/

    var editor = new Simditor({
        textarea: $('#chat'),
        toolbar: ['emoji', 'color', 'image'],
        emoji: {
            imagePath: 'public/img/emoji/'
        },
        upload: {
            url: '',
            params: null,
            fileKey: 'upload_file',
            connectionCount: 3,
            leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
        }
    });

    $('.right-side-tab').find('.tab').click(function () {
        $('.right-side-tab').find('.tab').attr('class', 'tab');
        $(this).addClass('active');
        $('.right-side-bottom').hide();
        $('.right-side-bottom').eq($(this).index()).show();
    });
    //$('.emotion').qqFace({
    //    id : 'facebox',
    //    assign:'chat',
    //    path:'public/img/emotion/'	//表情存放的路径
    //});

    drag('.title-bar');
    closeDialog();
    bindResize(document.getElementById('resize'));
    miniSize();
    openDialog();
    maxSize();
    var Chat = {};
    Chat.socket = null;
    Chat.connect = function (host) {
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
            //Console.tip('连接中...');
        };
        //客户端
        Chat.socket.onclose = function (message) {
            document.getElementById('chat').onkeydown = null;
            Console.tip('提示: 通讯端口关闭.');
        };

        var userlist = [];
        var roomlist = [];
        var clientname;
        var roomname;
        //服务器端
        Chat.socket.onmessage = function (message) {
            if (message.data.indexOf("*ULGNN") >= 0) {
                Console.tip('连通状态');
                clientname = message.data.substring(7, message.data.length).trim();
                roomname = "大厅";
                $('#chat-body').data('uid', clientname);
                $('.simditor-body').keydown(function () {
                    if (event.keyCode === 13) {
                        Chat.sendMessage(clientname, roomname);
                        editor.setValue('');
                    }
                });
                $(".sub_btn").on("click", function () {
                    Chat.sendMessage(clientname, roomname);
                    editor.setValue('');
                })
            } else if (message.data.indexOf("*ULIST") >= 0) {
                var jsonStr = message.data.substring(7, message.data.length);
                var rfc = eval("(" + jsonStr + ")");
                userlist = rfc;
                roomname = rfc[0].roomname;
                //var rfc = eval("("+message.data+")");

                //userlist.push(rfc);
                $('.user-list').html('');
                for (var i = 0; i < rfc.length; i++) {
                    Console.list(rfc[i].username, rfc[i].info);
                }
            } else if (message.data.indexOf("*UROOMS") >= 0) {
                $("#728894").find(".arrowSign").addClass("hover");
                var jsonRooms = message.data.substring(7, message.data.length);
                var rfc = eval("(" + jsonRooms + ")");
                roomlist = rfc;

                Chat.extractString = function (base) {
                    for (var i = 0; i < rfc.length; i++) {
                        if (rfc[i].name.substr(rfc[i].name.length - base.length, base.length) === base)
                            return rfc[i].name;
                    }
                    return "false";
                };

                $(".tree a").on("click", function () {
                    var base;
                    if ($(this).parent("li").parent("ul").prev().text() === '') {
                        base = $(this).text();
                    } else {
                        base = $(this).parent("li").parent("ul").prev().text() + '/' + $(this).text();
                    }
                    var result = Chat.extractString(base);
                    if (roomname === result) {
                        Console.log("你目前已在 <i>" + result + "</i> 房间", 'general');
                    } else {
                        Chat.socket.send("**##CRMCG" + roomname + "~" + result + "~" + clientname);
                        $(".tip").text("-->" + result);
                    }
                });
            } else if (message.data.indexOf("*URMVD") >= 0) {
                var user = message.data.substring(7, message.data.length);
                for (var i = 0; i < userlist.length; i++) {
                    if (userlist[i].username === user.trim()) {
                        userlist.splice(i, 1);
                        break;
                    }
                }
                $('.user-list').html('');
                for (var i = 0; i < userlist.length; i++) {
                    Console.list(userlist[i].username, userlist[i].info);
                }
                Console.log(user, 'info_user_exit');
            } else if (message.data.indexOf("*UJOIN") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");
                var username = rfc[0].username;
                userlist = userlist.concat(rfc);

                $('.user-list').html('');
                for (var i = 0; i < userlist.length; i++) {
                    Console.list(userlist[i].username, userlist[i].info);
                }
                if (clientname !== username) {
                    Console.log(username, 'info_user_join');
                }
            } else if (message.data.indexOf("*UCGRM") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");

                if (clientname === rfc.userName) {
                    roomname = rfc.newRoom;
                    $("#" + rfc.oldID).find(".arrowSign").removeClass("hover");
                    $("#" + rfc.newID).find(".arrowSign").addClass("hover");
                } else if (roomname === rfc.oldRoom) {
                    for (var k = 0; k < userlist.length; k++) {
                        if (userlist[k].username === rfc.userName) {
                            userlist.splice(k, 1);
                            break;
                        }
                    }
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i].username, userlist[i].info);
                    }
                    Console.log(rfc.userName + ',' + rfc.newRoom, 'info_user_room_change');
                }

                $("#" + rfc.oldID).find("span").text(rfc.oldCount);
                $("#" + rfc.newID).find("span").text(rfc.newCount);
                if (rfc.newID > 0) {
                    //$("#"+rfc.newID).find("img").attr("src", "public/img/usersIn.png");
                    $("#" + rfc.newID).find("img.usersIn").addClass("hover").siblings("img.usersOut").removeClass("hover");//.attr("src", "public/img/usersIn.png");
                }
                if (rfc.oldID < 1) {
                    //$("#"+rfc.oldID).find("img").attr("src", "public/img/usersOut.png");
                    $("#" + rfc.oldID).find("img.usersOut").addClass("hover").siblings("img.usersIn").removeClass("hover");
                    $("#" + rfc.oldID).find("span").text("--");
                }
            } else if (message.data.indexOf("*URMMT") >= 0) {
                var roomMeta = message.data.substr(7);
                $(".st_tree").html(roomMeta);
                $(".st_tree").SimpleTree({
                });
                /*$(".st_tree").SimpleTree({
                 /* 可无视代码部分
                 click: function (a) {
                 if (!$(a).attr("hasChild"))
                 alert($(a).attr("ref"));
                 }
                 });
                 $(".st_tree").html(roomMeta);
                 //$(roomlist).appendTo('.st_tree');*/
            }
            else if (message.data.indexOf("*UNEWS") >= 0) {
                var newsMeta = message.data.substr(7);
                /*$(".st_tree").html(newsMeta);
                 $(".st_tree").SimpleTree({
                 });*/
            }
            else {
                var data = eval("(" + message.data + ")");
                //$("#十三张").find(".arrowSign").addClass("hover");
                //alert(data.userMessage);
                if ($('#chat-body').data('uid') === data.chatMessage) {
                    Console.log(data.message, 'my');
                } else {
                    Console.log(data.message, 'other');
                }
            }
        };
    };


    Chat.initialize = function () {
        if (window.location.protocol === 'http:') {
            Chat.connect('ws://' + window.location.host + '/BizChat/chat');
            //Chat.connect('ws://http://139.227.229.44:8080/BizChat/chat');
            //Chat.connect('ws://139.227.229.44:8080/BizChat/chat');
        } else {
            Chat.connect('wss://' + window.location.host + '/BizChat/chat');
        }
    };

    Chat.sendMessage = function (username, roomname) {
        var message = editor.getValue();
        if (message !== '') {
            Chat.socket.send("**##CCMSG" + username + '~' + roomname + '~' + message);
        }
    };

    var Console = {};
    Console.log = function (message, type) {
        if (type === 'my') {
            $('<li class="my-chat" style="break-word">' + htmlDecode(message) + '</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        } else if (type === 'other') {
            $('<li class="other-chat" style="break-word">' + htmlDecode(message) + '</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        } else if (type === 'info_user_room_change') {
            var messages = message.split(',');
            $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i>' + messages[0] + '</i></strong></span>&nbsp刚离开去了<i><strong>' + messages[1]
                    + '</strong></i> 房间</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        } else if (type === 'info_user_exit') {
            $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i>' + message + '</i></strong></span>&nbsp刚登出系统.</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        } else if (type === 'info_user_join') {
            $('<li class="sys_info oliver"><img src="public/img/info.png"><span class="user"><strong><i>' + message + '</i></strong></span>&nbsp刚进入房间</li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        } else if (type === 'general') {
            $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user">' + message + '</span></li>').appendTo('#console');
            var chatter = document.getElementById('console');
            chatter.scrollTop = chatter.scrollHeight;
        }
    };

    Console.list = function (tip, info) {
        $('<li><div class="avatar-left"><img src="public/img/avatar.png" width="32" height="32"></div><div class="info"><p>' + tip + '</p><p>' + info + '</p></div></li>').appendTo('.user-list')
        //$(".user-list li").on("click", function () {
        //    $(".active-state").text("与 "+$(this).children(".info").children("p:first").text() + " 聊天中...")
        //})
    };
    Console.tip = function (tip) {
        $('<div class="clear-both"></div><p class="tip">' + tip + '</p>').appendTo('#console')
    };
    Chat.initialize();
});

//Html解码获取Html实体
function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

//拖动
function drag(el) {
    var disX = 0;
    var disY = 0;
    $(el).mousedown(function (ev) {
        disX = ev.pageX - $(this).offset().left;
        disY = ev.pageY - $(this).offset().top;
        var _this = $(this).parent();
        $(document).mousemove(function (ev) {
            $(_this).css('left', ev.pageX - disX);
            $(_this).css('top', ev.pageY - disY);
        });
        $(document).mouseup(function () {
            //取消事件
            $(document).off()
        })
    });
    //取消默认事件
    return false;
}

//插入表情


//聊天框大小调整
function bindResize(el) {
    var els = el.style,
            x = y = 0;
    $(el).mousedown(function (e) {
        x = e.clientX - el.parentNode.offsetWidth,
                y = e.clientY - el.parentNode.offsetHeight;
        el.setCapture ? (
                el.setCapture(),
                //设置事件
                el.onmousemove = function (ev) {
                    mouseMove(ev || event);
                },
                el.onmouseup = mouseUp
                ) : (
                $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                );
        e.preventDefault();
    });
    function mouseMove(e) {
        el.parentNode.style.width = e.clientX - x + 'px',
                el.parentNode.style.height = e.clientY - y + 'px';
    }
    function mouseUp() {
        el.releaseCapture ? (
                el.releaseCapture(),
                el.onmousemove = el.onmouseup = null
                ) : (
                $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                )
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Remove elements with "noscript" class - <noscript> is not allowed in XHTML
    var noscripts = document.getElementsByClassName("noscript");
    for (var i = 0; i < noscripts.length; i++) {
        noscripts[i].parentNode.removeChild(noscripts[i]);
    }
}, false);

function miniSize() {
    $('.fa-minus').click(function () {
        $('.right-content').hide();
        $('.left-content').hide();
        $('.resize').hide();
        $('.chat-wrapper').css('height', 'auto');
        $('.chat-wrapper').css('min-height', '0px');
        $(this).removeClass('fa-minus');
        $(this).addClass('fa-square-o');
        reinstate();
    });
}

function reinstate() {
    $('.fa-square-o').click(function () {
        $('.chat-wrapper').css('height', '533px');
        $('.chat-wrapper').css('min-height', '500px');
        $('.right-content').show();
        $('.left-content').show();
        $('.resize').show();
        $(this).removeClass('fa-square-o');
        $(this).addClass('fa-minus');
        miniSize();
    });
}

function maxSize() {
    $('.fa-plus').click(function () {
        $('.chat-wrapper').css('height', $(window).height() + "px");
        $('.chat-wrapper').css('width', $(window).width() + "px");
        $('.chat-wrapper').css('top', '0px');
        $('.chat-wrapper').css('left', '0px');
    })
}

function closeDialog() {
    $('.fa-remove').click(function () {
        $('.chat-wrapper').hide();
    });
}
function openDialog() {
    $('.chat-open').click(function () {
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