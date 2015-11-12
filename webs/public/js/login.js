$(function () {
    var num = Math.floor(Math.random() * 10 + 1);
    //$("#checkboxFiveInput").attr("checked", "checked");
    $('.btn-login').click(function (e) {
        var username = $("#username").val();
        var str = username.replace(/[^\x00-\xff]/g, 'xx');
        if (str.length <= 2) {
            alert("用户名太短！（字数长度必须大于2）");
            $("#username").focus();
            return;
        } else if (str.length > 15) {
            alert("用户名太长！（字数长度必须小于15）");
            $("#username").focus();
            $("#username").select();
            return;
        }
        editorInit('\uf030');
        $('.loading').show();
        Chat.initialize();
        toggleSend();
        e.stopPropagation()
    });
    $('.male-img').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.arrow').css('left', '5px');
        $('.male-avatar').show(180);
        $('.arrow-down').css('top', '7px');
        e.stopPropagation();
    });
    $('.female-img').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.arrow').css('left', '5px');
        $('.female-avatar').show(200);
        $('.arrow-down').css('top', '7px');
        e.stopPropagation();
    });
    $('.gay-img').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.arrow').css('left', '5px');
        $('.gay-avatar').show(200);
        $('.arrow-down').css('top', '7px');
        e.stopPropagation();
    });
    $('.avatar-choose-wrapper img').click(function (e) {
        var val = $(this).attr('src');
        $('.show-avatar').attr('src', val);
        $('#avatar-value').val(val);
        e.stopPropagation();
        $('.avatar-choose-wrapper').hide();
    });
    $('.sex-male').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.radio-avatar').hide();
        $('.male-img').show();
        $('#avatar-value').val('public/img/avatar/male' + num + '.png');
        e.stopPropagation();
    });
    $('.sex-female').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.radio-avatar').hide();
        $('.female-img').show();
        $('#avatar-value').val('public/img/avatar/female' + num + '.png');
        e.stopPropagation();
    });
    $('.sex-gay').click(function (e) {
        $('.avatar-choose-wrapper').hide();
        $('.radio-avatar').hide();
        $('.gay-img').show();
        $('#avatar-value').val('public/img/avatar/neutral' + num + '.png');
        e.stopPropagation();
    });
    $(document).click(function () {
        $('.avatar-choose-wrapper').hide();
    });
    $('.fa-angle-right').click(function (e) {
        $(this).parent().find('.avatar-tab').toggle(200);
        $(this).parent().find('i').toggle(200);
        e.stopPropagation();
    });
    $('.fa-angle-left').click(function (e) {
        $(this).parent().find('.avatar-tab').toggle(200);
        $(this).parent().find('i').toggle(200);
        e.stopPropagation();
    });
});