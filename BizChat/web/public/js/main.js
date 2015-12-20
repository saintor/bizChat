/**
 * Created by Kelvin on 8/25/15.
 */
$(function () {
    drag('.title-bar');
    closeDialog();
    isMember();
    bindResize(document.getElementById('resize'));
    reinstate();
    openDialog();
    maxSize();
    tabControll();
    searchUser();
    toggleMsgcenter();
    hideUploadPrompt();
    $("#other-tree").SimpleTree({
        /* 可无视代码部分*/
        //click: function (a) {
        //    if (!$(a).attr("hasChild"))
        //        alert($(a).attr("ref"));
        //}
    });

});

document.addEventListener("DOMContentLoaded", function () {
    // Remove elements with "noscript" class - <noscript> is not allowed in XHTML
    var noscripts = document.getElementsByClassName("noscript");
    for (var i = 0; i < noscripts.length; i++) {
        noscripts[i].parentNode.removeChild(noscripts[i]);
    }
}, false);
