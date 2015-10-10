/**
 * Created by jimmy on 10/1/15.
 */
var Chat = {};
Chat.socket = null;
var userlist = [];
var roomlist = [];
var clientname;
var roomname;
var currentUser;
Chat.login = function (host) {
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
        //Console.tip('连通状态');
        var username = $.trim($('#username').val()),
                password = $.trim($('#password').val()),
                avatar = $('#avatar-value').val();
        if (password.length > 0) {
            Chat.socket.send("**##CLGNM " + username + "~" + password + "~" + avatar);
        } else {
            Chat.socket.send("**##CLGNN " + username + "~" + avatar);
        }
    };
    //客户端
    Chat.socket.onclose = function (message) {
        $('.wysiwyg-editor').onkeydown = null;
        Console.tip('提示: 通讯端口关闭.');
    };
    //Chat.socket.onError = function (message) {
    //    console.log(message);
    //};

    //服务器端
    Chat.socket.onmessage = function (message) {
        if (message.data.indexOf("*ULGNN") >= 0) {
            currentUser = eval("(" + message.data.substring(7, message.data.length).trim() + ")");
            if (currentUser !== "false") {
                $('.login-wrapper').hide();
                $('.dialog-wrapper').show();
                Console.tip('连通状态');
                roomname = "大厅";
                $('.room-name').html(roomname);
                var isNewLine = true;
                $("#cert").click(function () {
                    $(this).parent().siblings("ul").toggleClass("hover");
                });
                $(".bottom-send ul>li").on("click", function () {
                    if ($(this).text() === '按Enter键发送信息') {
                        isNewLine = true;
                    } else {
                        isNewLine = false;
                    }
                    $(".ss_text").text($(this).text());
                    $(".bottom-send ul").removeClass("hover");
                });
                $('.wysiwyg-editor').keydown(function () {
                    if (isNewLine) {
                        if (event.keyCode === 13) {
                            Chat.sendMessage(clientname, roomname);
                        }
                    }
                });
                $(".sub_btn").on("click", function () {
                    Chat.sendMessage(clientname, roomname);
                    $('.wysiwyg-editor').html('')
                });
                Chat.com();
            } else {

                $('.error-info').show(200);
                //信息有错误
            }
        }
    };
};
Chat.sendMessage = function (username, roomname) {
    var editor = $('.wysiwyg-editor');
    var content = editor.text();
    var message = editor.html();
    if (content.trim() !== '' || message !== '') {
        Chat.socket.send("**##CCMSG" + username + '~' + roomname + '~' + message);
        setTimeout(function () {
            editor.html('');
        }, 5);
    }
};

Chat.com = function () {
    if (Chat.socket !== null) {
        Chat.socket.onclose = function (message) {
            $('.wysiwyg-editor').onkeydown = null;
            Console.tip('提示: 通讯端口关闭.');
        };
        Chat.socket.onmessage = function (message) {
            if (message.data.indexOf("*ULIST") >= 0) {
                console.log(message.data);
                var jsonStr = message.data.substring(7, message.data.length);
                var rfc = eval("(" + jsonStr + ")");
                userlist = rfc;
                clientname = rfc[0].username;
                roomname = rfc[0].roomname;
                //var rfc = eval("("+message.data+")");
                //userlist.push(rfc);
                console.log(rfc);
                $('.user-list').html('');
                for (var i = 0; i < rfc.length; i++) {
                    Console.list(rfc[i].username, rfc[i].info, rfc[i].avatar);
                }
                $('.people-num').text('(' + userlist.length + ')');

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
                        $('.tip').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                            $(this).removeClass('animated bounceInLeft');
                        });
                        animateDom();
                    }
                });
            } else if (message.data.indexOf("*URMVD") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");
                if (roomname === rfc.roomname) {
                    var user = rfc.userName;
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
                }
                var newCount = parseInt($("#" + rfc.roomID).find("span").text()) - 1;
                if (rfc.newCount > 0) {
                    $("#" + rfc.roomID).find("span").text(newCount);
                } else {
                    //$("#"+rfc.oldID).find("img").attr("src", "public/img/usersOut.png");
                    $("#" + rfc.roomID).find("img.usersOut").addClass("hover").siblings("img.usersIn").removeClass("hover");
                    $("#" + rfc.roomID).find("span").text("--");
                }
            } else if (message.data.indexOf("*UJOIN") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");

                if (roomname === rfc[0].roomname) {
                    var username = rfc[0].username;
                    userlist = userlist.concat(rfc);
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i].username, userlist[i].info, userlist[i].avatar);
                    }
                    Console.log(username, 'info_user_join');
                }
                $("#" + rfc[0].roomID).find("img.usersIn").addClass("hover").siblings("img.usersOut").removeClass("hover"); //regardless
                $("#" + rfc[0].roomID).find("span").text(userlist.length);
            } else if (message.data.indexOf("*UCGRM") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");

                if (clientname === rfc.userName) {
                    roomname = rfc.newRoom;
                    $("#" + rfc.oldID).find(".arrowSign").removeClass("hover");
                    $("#" + rfc.newID).find(".arrowSign").addClass("hover");
                    $('.room-name').html(roomname);
                    $('.people-num').text('(' + userlist.length + ')');
                } else if (roomname === rfc.oldRoom) {
                    for (var k = 0; k < userlist.length; k++) {
                        if (userlist[k].username === rfc.userName) {
                            userlist.splice(k, 1);
                            break;
                        }
                    }
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i].username, userlist[i].info, userlist[i].avatar);
                    }
                    Console.log(rfc.userName + ',' + rfc.newRoom, 'info_user_room_change');
                }

                $("#" + rfc.oldID).find("span").text(rfc.oldCount);
                $("#" + rfc.newID).find("span").text(rfc.newCount);
                if (rfc.newCount > 0) {
                    //$("#"+rfc.newID).find("img").attr("src", "public/img/usersIn.png");
                    $("#" + rfc.newID).find("img.usersIn").addClass("hover").siblings("img.usersOut").removeClass("hover");//.attr("src", "public/img/usersIn.png");
                }
                if (rfc.oldCount < 1) {
                    //$("#"+rfc.oldID).find("img").attr("src", "public/img/usersOut.png");
                    $("#" + rfc.oldID).find("img.usersOut").addClass("hover").siblings("img.usersIn").removeClass("hover");
                    $("#" + rfc.oldID).find("span").text("--");
                }
            } else if (message.data.indexOf("*URMMT") >= 0) {
                var roomMeta = message.data.substr(7),
                        room = $('.room');
                room.html(roomMeta);
                room.SimpleTree({
                    /* 可无视代码部分*/
                    //click: function (a) {
                    //    if (!$(a).attr("hasChild"))
                    //        alert($(a).attr("ref"));
                    //}
                });
                //$(roomlist).appendTo('.st_tree');
            } else if (message.data.indexOf("*UNEWS") >= 0) {
                var newsMeta = message.data.substr(7);
                $("#other-tree").html(newsMeta);
                $(".other-tree").SimpleTree({
                    /* 可无视代码部分*/
                    //click: function (a) {
                    //    if (!$(a).attr("hasChild"))
                    //        alert($(a).attr("ref"));
                    //}
                });
                $('.hyperlink').click(function () {
                    if ($(this).attr('href')) {
                        window.open($(this).attr('href'));
                    }
                });
                showCover();
                //$(document).on("click",".hyperlink",function(){
                //    alert(1);
                //});
            } else {
                var data = eval("(" + message.data + ")");
                //$("#十三张").find(".arrowSign").addClass("hover");
                //alert(data.userMessage);
                if (currentUser.name === data.username) {
                    Console.log(data.message, 'my', currentUser);
                } else {
                    for (var i = 0; i < userlist.length; i++) {
                        if (userlist[i].username === data.username) {
                            Console.log(data.message, 'other', userlist[i]);
                        }
                    }
                }
            }
        };
    }
};
Chat.initialize = function () {
    if (window.location.protocol === 'http:') {
        Chat.login('ws://' + window.location.host + '/BizChat/chat');
    } else {
        //Chat.connect('ws://192.168.11.79/BizChat/chat');
        Chat.login('ws://223.167.255.23:8080/BizChat/chat');
    }
};
var Console = {};
Console.log = function (message, type, currentUser) {
    if (type == 'my') {
        var avatar = "background-image:url('" + currentUser.avatar + "')";
        console.log(avatar);
        $('<p class="dialog-name">' + currentUser.name + '</p><li class="my-chat" style="break-word"><span class="chat-my-avatar" style="' + avatar + '"></span>' + htmlDecode(message) + '</li>').appendTo('#console');
        $('.wysiwyg-editor').html('');
        scrollBack()
    } else if (type == 'other') {
        var avatar = "background-image:url('" + currentUser.avatar + "')";
        $('<p class="dialog-name-other">' + currentUser.username + '</p><li class="other-chat" style="break-word"><span class="chat-other-avatar" style="' + avatar + '"></span>' + htmlDecode(message) + '</li>').appendTo('#console');
        scrollBack()
    } else if (type == 'info_user_room_change') {
        var messages = message.split(',');
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i>' + messages[0] + '</i></strong></span>&nbsp刚离开去了<i><strong>' + messages[1]
                + '</strong></i> 房间</li>').appendTo('#console');
        scrollBack()
    } else if (type == 'info_user_exit') {
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i>' + message + '</i></strong></span>&nbsp刚登出系统.</li>').appendTo('#console');
        scrollBack()
    } else if (type == 'info_user_join') {
        $('<li class="sys_info oliver"><img src="public/img/info.png"><span class="user"><strong><i>' + message + '</i></strong></span>&nbsp刚进入房间</li>').appendTo('#console');
        scrollBack()
    } else if (type == 'general') {
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user">' + message + '</span></li>').appendTo('#console');
        scrollBack()
    }
    $('.my-chat a').each(function () {
        $(this).attr('target', '_blank');
        if ($(this).attr('href').indexOf('http://') != 0) {
            var link = $(this).attr('href');
            $(this).attr('href', 'http://' + link);
        }
    });
};

Console.list = function (tip, info, avatar) {
    console.log(currentUser);
    $('<li><div class="avatar-left"><img src="' + avatar + '" width="32" height="32"></div><div class="info"><p class="tab-name">' + tip + '<i class="fa fa-sort-down down"></i></p><p>' + info + '</p></div></li>').appendTo('.user-list')
    showProfile(currentUser.avatar, currentUser);
};

Console.tip = function (tip) {
    $('<div class="clear-both"></div><p class="tip animated bounceInLeft">' + tip + '</p>').appendTo('#console');
    $('.tip').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).removeClass('animated bounceInLeft');
    });
    animateDom();
};