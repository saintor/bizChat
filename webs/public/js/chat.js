var Chat = {};
Chat.socket = null;
var userlist = [];
var roomlist = [];
var clientname;
var roomname;
var currentUser;
var isNewLine = true;
var msgNum = 0;
var chat_history;
var privateChats = {};
var roomChanged = false;
var cIndex = 1;
var wIndex = 1;
var CHAT_COM_PRRFIX = '**##C';
var com_code = {
    LOGIN_MEMBER: CHAT_COM_PRRFIX + 'LGNN ',
    LOGIN: CHAT_COM_PRRFIX + 'LGNN ',
    JOIN: CHAT_COM_PRRFIX + 'JOIN ',
    EXIT: CHAT_COM_PRRFIX + 'EXIT ',
    CHAT_MSG: CHAT_COM_PRRFIX + 'CMSG ',
    PRIV_CHAT: CHAT_COM_PRRFIX + 'PMSG ',
    ROOM_CHANGE: CHAT_COM_PRRFIX + 'RMCG ',
    USER_NEWS: CHAT_COM_PRRFIX + 'NEWS ',
    USER_AD: CHAT_COM_PRRFIX + 'UADS ',
    PREV_CHAT: CHAT_COM_PRRFIX + 'PTXT '
};
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
        if ($('#checkboxFiveInput').attr("checked") === "checked") {
            if (password.length > 0) {
                Chat.socket.send("**##CLGNM " + username + "~" + password + "~" + avatar);
            }
        } else if (username.length > 0) {
            Chat.socket.send("**##CLGNN " + username + "~" + avatar);
        }
    };
    //客户端
    Chat.socket.onclose = function (message) {
        $('.wysiwyg-editor').onkeydown = null;
        //Console.tip('提示: 通讯端口关闭.');
    };
    //Chat.socket.onError = function (message) {
    //    console.log(message);
    //};

    //服务器端
    Chat.socket.onmessage = function (message) {
        if (message.data.indexOf("*ULGNN") >= 0) {
            if (message.data.substring(7, message.data.length).trim() === "taken") {
                $('.error-info').text('系统内此用户名已被使用');
                $('.error-info').show(200);
                Chat.socket.close();
            } else {
                currentUser = eval("(" + message.data.substring(7, message.data.length).trim() + ")");
                if (currentUser.toString() !== "false") {
                    $('.login-wrapper').hide();
                    $('.dialog-wrapper').show();
                    roomname = "大厅";
                    Console.tip(roomname);
                    $('.room-name').html(roomname);
                    $("#cert").click(function () {
                        $(this).parent().siblings("ul").toggleClass("hover");
                    });
                    toggleSend();
                    var editor;
                    $('.wysiwyg-editor').keydown(function () {
                        editor = this;
                        if (isNewLine) {
                            if (event.keyCode === 13) {
                                Chat.sendMessage(clientname, roomname, editor);
                            }
                        }
                    });
                    $(".sub_btn").on("click", function () {
                        Chat.sendMessage(clientname, roomname, editor);
                    });
                    Chat.com();
                } else {
                    $('.error-info').text('用户信息提交不正确，请重试！');
                    $('.error-info').show(200);
                    Chat.socket.close();
                }
            }
        }
    };
};
Chat.sendMessage = function (username, roomname, editor) {
    var content = $(editor).text();
    var message = $(editor).html();
    console.log(message);
    if (content.trim() !== '' || message !== '') {
        Chat.socket.send(com_code.CHAT_MSG + username + '~' + roomname + '~' + message);
        setTimeout(function () {
            $(editor).html('');
        }, 5);
    }
};

Chat.com = function () {
    if (Chat.socket !== null) {
        $(window).on('beforeunload', function () {
            return '确定离开页面吗？';
        });
        Chat.socket.onclose = function (message) {
            $('.wysiwyg-editor').onkeydown = null;
            Console.tip('提示: 通讯端口关闭.');
        };
        Chat.socket.onmessage = function (message) {
            if (message.data.indexOf("*ULIST") >= 0) {
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
                    Console.list(rfc[i]);
                }
                showProfile(userlist, currentUser);
                $('.people-num').text('(' + userlist.length + ')');
                if (roomChanged === true) {
                    Console.log(chat_history, 'prev', null, '.threadv0');
                    roomChanged = false;
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
                        Console.log("你目前已在 <i>" + result + "</i> 房间", 'general', null, '.threadv0');
                    } else {
                        Chat.socket.send(com_code.ROOM_CHANGE + roomname + "~" + result + "~" + clientname);
                        if (roomChanged === false) {
                            $('.loading-chat-wrapper').show();
                        }
                    }
                });
            } else if (message.data.indexOf("*URMVD") >= 0) {
                var data = message.data.substring(7, message.data.length);
                var userName = data.substring(0, data.indexOf("~"));
                var roomName = data.substring(data.indexOf("~") + 1, data.lastIndexOf("~"));
                var roomID = data.substr(data.lastIndexOf("~") + 1);
                if (roomname === roomName) {
                    for (var i = 0; i < userlist.length; i++) {
                        if (userlist[i].username === userName) {
                            userlist.splice(i, 1);
                            break;
                        }
                    }
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i]);
                    }
                    showProfile(userlist, currentUser);
                    $('.people-num').text('(' + userlist.length + ')');
                    Console.log(userName, 'info_user_exit', null, '.threadv0');
                }
                var newCount = parseInt($("#" + roomID).find("span").text()) - 1;
                if (newCount > 0) {
                    $("#" + roomID).find("span").text(newCount);
                } else {
                    //$("#"+rfc.oldID).find("img").attr("src", "public/img/usersOut.png");
                    $("#" + roomID).find("img.usersOut").addClass("hover").siblings("img.usersIn").removeClass("hover");
                    $("#" + roomID).find("span").text("--");
                }
            } else if (message.data.indexOf("*UJOIN") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");

                if (roomname === rfc[0].roomname) {
                    var username = rfc[0].username;
                    userlist = userlist.concat(rfc);
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i]);
                    }
                    showProfile(userlist, currentUser);
                    $('.people-num').text('(' + userlist.length + ')');
                    Console.log(username, 'info_user_join', null, '.threadv0');
                }
                $("#" + rfc[0].roomID).find("img.usersIn").addClass("hover").siblings("img.usersOut").removeClass("hover"); //regardless
                $("#" + rfc[0].roomID).find("span").text(userlist.length);
            } else if (message.data.indexOf("*UCGRM") >= 0) {
                jsonStr = message.data.substring(7, message.data.length);
                rfc = eval("(" + jsonStr + ")");
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
                if (clientname === rfc.userName) {
                    roomname = rfc.newRoom;
                    $('.loading-chat-wrapper').hide();
                    $("#" + rfc.oldID).find(".arrowSign").removeClass("hover");
                    $("#" + rfc.newID).find(".arrowSign").addClass("hover");
                    $('.room-name').html(roomname);
                    $('.people-num').text('(' + userlist.length + ')');

                    $('.tab').removeClass('active');
                    $('.tab').eq(0).addClass('active');
                    $('.room-wrapper').hide();
                    $('.chat-thread').html('');
                    //$(".tip").text("-->" + result);
                    $('.tip').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $(this).removeClass('animated bounceInLeft');
                    });
                    animateDom();
                    $('.userlist').show();
                    Console.tip("-->" + roomname);
                    Console.log(chat_history, 'prev', null, '.threadv0');
                    roomChanged = false;
                } else if (roomname === rfc.oldRoom) {
                    for (var k = 0; k < userlist.length; k++) {
                        if (userlist[k].username === rfc.userName) {
                            userlist.splice(k, 1);
                            break;
                        }
                    }
                    $('.user-list').html('');
                    for (var i = 0; i < userlist.length; i++) {
                        Console.list(userlist[i]);
                    }
                    showProfile(userlist, currentUser);
                    $('.people-num').text('(' + userlist.length + ')');
                    Console.log(rfc.userName + ',' + rfc.newRoom, 'info_user_room_change', null, '.threadv0');
                }
            } else if (message.data.indexOf("*URMMT") >= 0) {
                var roomMeta = message.data.substr(7);
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
                showUploadPrompt();
                $('#upload-article').click(function () {
                    var newstitle = $('#article-title').val(),
                            newsurl = $('#article-url').val(),
                            path = $('.modal-node').text();

                    if ($.trim(newstitle).length > 0 && $.trim(newsurl).length > 0) {
                        if (newsurl.indexOf('http://') !== 0 && newsurl.indexOf('https://') !== 0) {
                            alert('请输入正确的URL协议（http://abc.com）');
                        } else {
                            var article = {
                                username: currentUser.username,
                                newstitle: newstitle,
                                newsurl: newsurl,
                                path: path
                            };
                            article = JSON.stringify(article);
                            Chat.socket.send(com_code.USER_NEWS + article);
                        }
                    } else {
                        alert('标题或URL不得为空');
                    }
                });
            } else if (message.data.indexOf(com_code.USER_NEWS) >= 0) {
                //跳出新闻上传回执内容框： var respond = 。。。。。 
                $('.upload-dialog').hide();
            } else if (message.data.indexOf(com_code.PRIV_CHAT) >= 0) {
                var msg = message.data.substr(com_code.PRIV_CHAT.length);
                var data = eval("(" + msg + ")");
                console.log(data);
                if (privateChats[data.sender] === undefined) {
                    msgNum++;
                    showMsgNum(msgNum);
                    //sender reciver message
                    insertUnread(data.sender, data.message);
                } else {
                    for (var i = 0; i < userlist.length; i++) {
                        if (userlist[i].username === data.sender) {
                            Console.log(data.message, 'other', userlist[i], '.threadv' + privateChats[data.sender]);
                            break;
                        }
                    }
                    //Console.log(data.message, 'other', currentUser, '.threadv' + privateChats[reciever]);
                }
            } else if (message.data.indexOf(com_code.PREV_CHAT) >= 0) {
                chat_history = message.data.substr(com_code.PREV_CHAT.length);
                roomChanged = true;
            } else if (message.data.indexOf(com_code.USER_AD) >= 0) {
                var data = message.data.substr(com_code.USER_AD.length);
                var userName = data.substring(0, data.indexOf("~"));
                var info = data.substr(data.lastIndexOf("~") + 1);
                for (var i = 0; i < userlist.length; i++) {
                    if (userlist[i].username === userName) {
                        userlist[i].info = info;
                    }
                }
                $('.user-list').html('');
                for (var i = 0; i < userlist.length; i++) {
                    Console.list(userlist[i]);
                }
                showProfile(userlist, currentUser);
            } else {
                console.log(message.data);
                var data = eval("(" + message.data + ")");
                //$("#十三张").find(".arrowSign").addClass("hover");
                //alert(data.userMessage);
                console.log(data.message);
                if (currentUser.username === data.username) {
                    Console.log(data.message, 'my', currentUser, '.threadv0');
                } else {
                    for (var i = 0; i < userlist.length; i++) {
                        if (userlist[i].username === data.username) {
                            Console.log(data.message, 'other', userlist[i], '.threadv0');
                            break;
                        }
                    }
                }
            }
        };
    }
};
Chat.initialize = function () {
    if (window.location.protocol === 'file:') {
        //Chat.login('ws://' + window.location.host + '/BizChat/chat');
        Chat.login('ws://112.74.110.21:8080/BizChat/chat');
    } else {
        //Chat.connect('ws://192.168.11.79/BizChat/chat');
        Chat.login('ws://223.167.255.254:8080/BizChat/chat');
    }
};
var Console = {};
Console.log = function (message, type, user, window) {
    if (type === 'my') {
        var avatar = "background-image:url('" + user.avatar + "')";
        console.log(avatar);
        $('<p class="dialog-name">' + user.username + '</p><li class="my-chat" style="break-word"><span class="chat-my-avatar" style="' + avatar + '"></span>' + htmlDecode(message) + '</li>').appendTo(window);
        $('.wysiwyg-editor').html('');
        scrollBack(window);
    } else if (type === 'other') {
        var avatar = "background-image:url('" + user.avatar + "')";
        $('<p class="dialog-name-other">' + user.username + '</p><li class="other-chat" style="break-word"><span class="chat-other-avatar" style="' + avatar + '"></span>' + htmlDecode(message) + '</li>').appendTo(window);
        scrollBack(window);
    } else if (type === 'info_user_room_change') {
        var messages = message.split(',');
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i><u>' + messages[0] + '</u></i></strong></span>&nbsp刚离开去了<i><strong>' + messages[1]
                + '</strong></i> 房间</li>').appendTo(window);
        scrollBack(window);
    } else if (type === 'info_user_exit') {
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user"><strong><i><u>' + message + '</u></i></strong></span>&nbsp刚登出系统.</li>').appendTo(window);
        scrollBack(window);
    } else if (type === 'info_user_join') {
        $('<li class="sys_info oliver"><img src="public/img/info.png"><span class="user"><strong><i><u>' + message + '</i></u></strong></span>&nbsp刚进入房间</li>').appendTo(window);
        scrollBack(window);
    } else if (type === 'general') {
        $('<li class="sys_info gray"><img src="public/img/info.png"><span class="user">' + message + '</span></li>').appendTo(window);
        scrollBack(window);
    } else if (type === 'prev') {
        if (message.indexOf('房内已长时间') === 0) {
            $('<li class="sys_info gray chat_history"><img src="public/img/info.png"><span class="user">' + htmlDecode(message) + '</span></li>').appendTo(window);
        } else {
            $('<li class="sys_info gray chat_history"><span class="user">' + htmlDecode(message) + '</span></li>').appendTo(window);
        }
        scrollBack(window);
    }
    $('.my-chat a').each(function () {
        $(this).attr('target', '_blank');
        if ($(this).attr('href').indexOf('http://') !== 0) {
            var link = $(this).attr('href');
            $(this).attr('href', 'http://' + link);
        }
    });
};

Console.list = function (user) {
    var userAdClass = 'ad' + user.username;
    var color = user.info === '无信息' ? 'silver' : 'red';
    $('<li><div class="avatar-left"><img src="' + user.avatar + '" width="32" height="32"></div><div class="info"><p class="tab-name">' + user.username + '<i class="fa fa-sort-down down"></i></p>\n\
<p> <ul class="' + userAdClass + '"><font size=2 color="' + color + '")>' + user.info + '</font>' + adDetail(user) + '</ul></p></div></li>').appendTo('.user-list');
    $("." + userAdClass + "," + userAdClass + " li").mouseover(function () {
        $("." + userAdClass + " div").show();
    }).mouseout(
            function () {
                $("." + userAdClass + " div").hide();
            });
    /*
     * <div class="adImg"><img src="public/img/Kevin.png"></div>\n\
     <div class="adDetail">\n\
     <div class="adTitle"><center>"长寿路朝南2室一厅，高尚小区"</center></div>\n\
     <div class="vendor">商户名称：xxxx</div><div class="link">相关链接：<a href="abc,com">abc.com</a></div>\n\
     <div class="adContent">adv info powered by ' + user.username + 'adv info powered by ' + user.username + 'adv info powered by ' + user.username + '</div> \n\
     </div>\n\
     
     **/
};

Console.tip = function (tip) {
    
    $('<div class="clear-both"></div><p class="tip animated bounceInLeft">' +  tip  + '<marquee behavior="scroll" contenteditable="true" onstart="this.firstChild.innerHTML+=this.firstChild.innerHTML;" scrollamount="3" width="215" onmouseover="this.stop();" onmouseout="this.start();"style="float:right;"><ul style="width:200px"><li>信息1</li><li>信息2</li><li>信息3</li></ul></marquee></p>').appendTo('.chat-wrapper');
    $('.tip').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        $(this).removeClass('animated bounceInLeft');
    });
    animateDom();
};