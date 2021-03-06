/**
 * Created by jimmy on 10/1/15.
 */

function reinstate() {
    $('.fa-square-o').click(function () {
        $('.chat-wrapper').css('width', '780px').css('height', '590px').css('min-height', '570px').css('top', '10%').css('left', '20%');
        $('.right-content').show();
        $('.left-content').show();
        $('.resize').show();
    });
}

function maxSize() {
    $('.fa-plus').click(function () {
        $('.right-content').show();
        $('.left-content').show();
        $('.chat-wrapper').css('height', $(window).height() + "px").css('width', $(window).width() + "px").css('top', '0px').css('left', '0px');
        $('.resize').show();
    });
}

function closeDialog() {
    $('#chat-wrapper .fa-remove').click(function () {
        $('#chat-wrapper .right-content').hide();
        $('#chat-wrapper .left-content').hide();
        $('#chat-wrapper').css('min-width', '0px').css('min-height', '0px').css('height', 'auto');
        $('#chat-wrapper .resize').hide();
    });
}

function closePrivateDialog(otherName) {
    $('.close-private').click(function () {
        $('.private-chat').hide();
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
        ad = '<div class="adframe">\n\
<iframe frameborder="0" style="width:406px;" src="http://112.74.110.21:8080/BizChat/ad/ad_' + user.username + '.html" scrolling="no"></iframe>\n\
</div>';
    }
    return ad;
}
function showProfile(userList, currentUser) {
    $('.down').click(function (e) {
        var left = $(this).position().left;
        var userName = $(this).parent().contents().filter(function () {
            return this.nodeType === 3;
        }).text();
        if (userName === currentUser.username) {
            var sex = currentUser.avatar;
            if (sex.indexOf('female') > 0) {
                sex = '女';
            } else if (sex.indexOf('male') > 0) {
                sex = '男';
            } else {
                sex = '同志';
            }
            $('<div class="profile"><p>性识: ' + sex + '</p><p>级别: 非会员</p><p>币值: 100</p>\n\
            <p>充值</p><p>兑现</p><p class="upload-info">发布信息</p>').appendTo($(this).parent());
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
function newChat(otherName) {
    var zIndex = $('.chat-wrapper').css('z-index');

    $('.new-chat').click(function (e) {
        zIndex++;
        cIndex++;
        wIndex++;
        privateChats[otherName] = wIndex;
        $('<div class="chat-wrapper private-chat" style="z-index:' + zIndex + '; position: absolute;top: 10%;left: 40%;">' +
                '<div class="title-bar"><span class="active-state"></span><div class="title-handle"><i class="fa fa-remove close-private"></i></div></div>' +
                '<div class="chat-middle"><ul class="chat-thread threadv' + wIndex + '"> <div class="clear-both"></div><p class="tip">和&nbsp;<i><u>' + otherName + '</u></i> &nbsp;私聊连通</p></ul><div class="clear-both"></div></div>' +
                '<div class="chat-msg editorv' + cIndex + '"> ' +
                '<textarea placeholder="请输入..." class="editor" class="text-post" autofocus="" maxlength="200"></textarea>' +
                '<div class="bottom-send"> <span class="ss_text"></span> <span class="sub-wrapper"> <span class="sub_btn">发送  </span> <i id="cert"></i> </span> <ul> <li>按Enter键发送信息</li> <li>按Enter键换行</li> </ul> </div> ' +
                '</div>' +
                '</div>').appendTo('#chat-body');
        $(document).click(function (e) {
            $('.profile').remove();
        });
        editorInit('\uf15c');
        drag('.title-bar');
        closePrivateDialog(otherName);
        var editorv = '.editorv' + cIndex;
        $(editorv).find('.wysiwyg-editor').keydown(function () {
            var editor = $(this);
            var content = editor.text();
            var message = editor.html();
            if (event.keyCode === 13) {
                if (content.trim() !== '' || message !== '') {
                    Chat.socket.send(prefix.PRIV_CHAT + currentUser.username + "~" + otherName + "~" + message);
                    Console.log(message, 'my', currentUser, '.threadv' + cIndex);
                    setTimeout(function () {
                        editor.html('');
                    }, 5);
                }
            }
        });
    });
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

function changeRoom() {

}

function toggleMsgcenter() {
    $('.fa-info-circle').click(function () {
        $('.unread-msg-wrapper').toggle();
    });
}
function showMsgNum(msgNum) {
    var numDiv = $('.msg-num');
    numDiv.css('display', 'inline-block');
    numDiv.text(msgNum);
}
function insertUnread(reciever, message) {
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

