/**
 * Created by jimmy on 10/1/15.
 */
var timeSeed = 0;
var timerID;
var window_max = false;

function reinstate() {
    $('.fa-square-o').click(function () {
        window_max = false;
        $('.chat-wrapper').css('width', '780px').css('height', '590px').css('min-height', '570px').css('top', '7%').css('left', '25%');
        $('.right-content').show();
        $('.left-content').show();
        $('.resize').show();
        for (var i = 0; i < slidelist.length; i++) {
            $('.marquee' + slidelist[i].id).css('display', 'none');
        }
    });
}

function maxSize() {
    $('.fa-plus').click(function () {
        window_max = true;
        $('.right-content').show();
        $('.left-content').show();
        $('.chat-wrapper').css('height', $(window).height() + "px").css('width', $(window).width() + "px").css('top', '0px').css('left', '0px');
        $('.resize').show();
        if (window_max) {
            for (var i = 0; i < slidelist.length; i++) {
                $('.marquee' + slidelist[i].id).show();
                $('.marquee' + slidelist[i].id).text(slidelist[i].info);
                $('.marquee' + slidelist[i].id).marquee({
                    //speed in milliseconds of the marquee
                    duration: 10000,
                    //gap in pixels between the tickers
                    gap: 80,
                    //time in milliseconds before the marquee will start animating
                    delayBeforeStart: 0,
                    //'left' or 'right'
                    direction: 'left',
                    //true or false - should the marquee be duplicated to show an effect of continues flow
                    duplicated: true
                });
            }
        }
    });
}

function closeDialog() {
    $('.fa-remove').click(function () {
        $('.right-content').hide();
        $('.left-content').hide();
        $('.chat-wrapper').css('min-width', '0px').css('min-height', '0px').css('height', 'auto');
        $('.resize').hide();
    });
}

function closePrivateDialog(otherName) {
    $('.close-private').click(function () {
        $('#private-chat'+privateChats[otherName]).hide();
        delete privateUnreadMsg[otherName];
        delete privateChats[otherName];        
    });
    //$(this).parent().parent().parent().remove(200);
}

function openDialog() {
    $('.chat-open').click(function () {
        $('.chat-wrapper').show();
    });
}
function scrollBack(window) {
    $(window)[0].scrollTop = $(window)[0].scrollHeight;
}
function tabControll() {
    $('.right-side-tab').find('.tab').click(function () {
        $('.right-side-tab').find('.tab').attr('class', 'tab');
        $(this).addClass('active');
        $('.right-side-bottom').hide().eq($(this).index()).show();
    });
}
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
            $(document).off();
        });
    });
    //取消默认事件
    return false;
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}
function animateDom() {
    $(".tip").bind('DOMNodeInserted', function (e) {
        $(e.target).addClass('animated bounceInLeft');
    });
}
function searchUser() {
    $('.search-input').keyup(function () {
        $('.result-inner').html('');
        self = this;
        $('.tab-name').each(function () {
            if ($(this).text().indexOf($(self).val()) !== -1) {
                var text = $(this).text();
                $('.result-inner').append(text);
            }
        });
    });
}
function hideUploadPrompt() {
    $('.modal-close').click(function () {
        $('.upload-dialog').hide();
    });
}
function showUploadPrompt() {
    $('.hyperlink').click(function () {
        var nodeId = $(this).parent().attr('id');
        var node = nodeId.replace('_', '/');
        console.log(node);
        var left = $(this).offset().left - 200;
        var top = $(this).offset().top + 30;
        $('.upload-dialog').show();
        $('.upload-dialog').css('left', left + 'px');
        $('.upload-dialog').css('top', top + 'px');
        $('.modal-node').text(node);
    });
}

function adDetail(user) {
    var ad = '';
    if (user.info !== "无信息") {
        ad = '<div class="adframe" style="margin-left: -50px;"><iframe frameborder="0" style="width:406px;" src="http://120.25.151.75:8080/BizChat/ad/ad_' + user.username + '.html" scrolling="yes"></iframe></div>';
    }
    return ad;
}

function showProfile(userList, currentUser) {
    $('.down').click(function (e) {
        var left = $(this).position().left;
        var userName = $(this).parent().contents().filter(function () {
            return this.nodeType === 3;
        }).text();
        if (userName.indexOf(currentUser.username) >= 0) {
            var sex = currentUser.avatar;
            if (sex.indexOf('female') > 0) {
                sex = '女';
            } else if (sex.indexOf('male') > 0) {
                sex = '男';
            } else {
                sex = '同志';
            }
            $('<div class="profile"><p>性识: ' + sex + '</p><p>级别: 非会员</p>\n\
            <p>充值</p><p>兑现</p><p class="ad-editor">发布信息</p>').appendTo($(this).parent());
        } else {
            var user;
            for (var i = 0; i < userList.length; i++) {
                if (userList[i].username === userName) {
                    user = userList[i];
                    break;
                }
            }
            var sex = user.avatar;
            if (sex.indexOf('female') > 0) {
                sex = '女';
            } else if (sex.indexOf('male') > 0) {
                sex = '男';
            } else {
                sex = '同志';
            }
            $('<div class="profile"><p>性识: ' + sex + '</p><p>级别: 非会员</p><p class="new-chat">发起对话</p>').appendTo($(this).parent());
        }
        $('.profile').css('left', left + 'px');
        e.stopPropagation();
        newChat(userName);
        $(document).click(function (e) {
            $('.profile').remove();
        });
    });
}

function showAd(userList) {
    var userName = $(this).parent().contents().filter(function () {
        return this.nodeType === 3;
    }).text();
    var user;
    for (var i = 0; i < userList.length; i++) {
        if (userList[i].username === userName) {
            user = userList[i];
            break;
        }
    }
}
function isMember() {
    /*if ($("#checkboxFiveInput").attr("checked") === true) {
     $("#password").show();
     } else {
     $("#password").hide();
     }*/

    $('.vip').change(function () {
        $('#password').toggle(200);
    });
}

var zIndex=1;
function newChat(otherName) {
    //var zIndex = $('.chat-wrapper').css('z-index');

    $('.ad-editor').click(function (e) {
        rex_open();
    });
    $('.new-chat').click(function (e) {
        if($('#private-chat'+privateChats[otherName]).length>0) return;
        zIndex++;
        var currentIndex = ++cIndex;
        wIndex++;
        privateChats[otherName] = wIndex;
        $('<div id="private-chat'+wIndex+'" class="private-chat" style="z-index:' + zIndex + '; position: absolute;top: 15%;left: 40%;">' +
                '<div class="title-bar"><span class="active-state"><font color="Gray"><i class="fa fa-wechat"></i>&nbsp;私聊(<i><u>' + otherName + '</u></i> )</font></span><div class="title-handle"><i class="fa fa-remove close-private"></i></div></div>' +
                '<div class="tipPriv">连通</div>' +
                '<div class="chat-middle"><ul class="chat-thread threadv' + wIndex + '"></ul></div>' +
                '<div class="chat-msg editorv' + cIndex + '"> ' +
                '<textarea placeholder="请输入..." class="editor" class="text-post" autofocus="" maxlength="200"></textarea>' +
                '<div class="bottom-send"> <span class="ss_text"></span> <span class="sub-wrapper"> <span class="sub_btn" onclick="sendPrivMsg(\''+otherName+'\','+currentIndex+')">发送  </span> <i id="cert"></i> </span> <ul> <li>按Enter键发送信息</li> <li>按Enter键换行</li> </ul> </div> ' +
                '</div>' +
                '</div>').appendTo('#chat-body');
        $(document).click(function (e) {
            $('.profile').remove();
        });
        editorInit('\uf15c', '\uf0ec');
        drag('.title-bar');
        closePrivateDialog(otherName);
        var editorv = '.editorv' + currentIndex;
        $(editorv).find('.wysiwyg-editor').keydown(function () {
            var editor = $(this);
            var content = editor.text();
            var message = editor.html();
            if (event.keyCode === 13) {
                if (content.trim() !== '' || message !== '') {
                    sendPrivMsg(otherName,currentIndex);
                }
            }
        });
        //msg center clicked
        if(e.target.tagName!='P'){
            onMsgCenterRowClick($(this),otherName);
        }
        
        $('.private-chat').click(function (e) {
            $(this).css('z-index',++zIndex);
        });        
        
    });
}

function sendPrivMsg(otherName,currentIndex){
    var editorv = '.editorv' + currentIndex;
    var editor = $(editorv).find('.wysiwyg-editor');
    var message = editor.html();
    Chat.socket.send(com_code.PRIV_CHAT + currentUser.username + "~" + otherName + "~" + message);
    Console.log(message, 'my', currentUser, '.threadv' + currentIndex);
    setTimeout(function () {
        editor.html('');
    }, 5);    
}

function toggleSend() {
    $(".bottom-send ul>li").on("click", function () {
        if ($(this).text() === '按Enter键发送信息') {
            isNewLine = true;
        } else {
            isNewLine = false;
        }
        $(".ss_text").text($(this).text());
        $(".bottom-send ul").removeClass("hover");
    });
}

function sendFile(fileName) {
    var file = document.getElementById(fileName).files[0];
    var websocket = new WebSocket("ws://120.25.151.75:8080/BizChat/images");
    websocket.onopen = function () {
        websocket.send('**##fname ' + currentUser.username + '~' + file.name + '~' + file.size);
    };
    websocket.onmessage = function (message) {
        if (message.data === 'ready') {
            var reader = new FileReader();
            var rawData = new ArrayBuffer();
            reader.readAsArrayBuffer(file);

            reader.loadend = function () {
                alert("the File has finished loading");
            };
            reader.onload = function (e) {
                rawData = e.target.result;
                websocket.binaryType = "arraybuffer";
                websocket.send(rawData);
            };
        }
    };
    websocket.onclose = function (message) {
        //alert(message.data);
    };
    websocket.onerror = function (e) {
        alert(e.msg);
    };
}

function toggleMsgcenter() {
    $('.fa-info-circle,.msg-num').click(function () {
        $('.unread-msg-wrapper').toggle();
    });
}
function showMsgNum(msgNum) {
    var numDiv = $('.msg-num');
    numDiv.css('display', 'inline-block');
    var oriNum = parseInt(numDiv.text());
    var newNum = oriNum+msgNum;
    numDiv.text(newNum);
    if(newNum==0){
        numDiv.css('display', 'none');
        $('.unread-msg-wrapper').toggle();
    }
}
function insertUnread(reciever) {
    if ($('span').is('.sender-name')) {
        $('.sender-name').each(function () {
            if ($(this).text() === reciever) {
            } else {
                $('<li class="new-chat"><span class="sender-name">' + reciever + '</span><span><img src="public/img/greenball.gif"></span></li>').appendTo('.unread-msg-list');
                newChat(reciever);
            }
        });
    } else {
        $('<li class="new-chat"><span class="sender-name">' + reciever + '</span><span><img src="public/img/greenball.gif"></span></li>').appendTo('.unread-msg-list');
        newChat(reciever);
    }
}


//a:panxw
function getCatgRootname(fullname){
    var endpos = fullname.indexOf('/');
    endpos=endpos==-1?fullname.length:endpos;
    return fullname.substring(0,endpos);
}

function getSysMesColor(type){
    var mFontColor = SYS_MES_COLOR[type];
    mFontColor=mFontColor==''?SYS_MES_COLOR_DEFAULT:mFontColor;
    return mFontColor;
}

function convertInt(s){
    return s==null || s=='' || isNaN(s) || typeof(s) == "undefined"?0:parseInt(s);
}

function onMsgCenterRowClick(mrow,otherName){
        if(typeof(privateChats[otherName]=='undefined')){
            mrow.remove();
            if(privateUnreadMsg[otherName]!=null){
                var messages = privateUnreadMsg[otherName];
                for(var i=0;i<messages.length;i++){
                    fillSenderMsg(otherName,messages[i]);            
                }                
                delete privateUnreadMsg[otherName]; 
                showMsgNum(-1);
            }
        }
}

function fillSenderMsg(sender,message) {
    for (var i = 0; i < userlist.length; i++) {
        if (userlist[i].username === sender) {
            Console.log(message, 'other', userlist[i], '.threadv' + privateChats[sender]);
            break;
        }
    }
    $('.threadv' + privateChats[sender]).html($('.threadv' + privateChats[sender]).html());
}
