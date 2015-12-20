/**
 * Created by jimmy on 10/1/15.
 */
function editorInit() {
    var editor = $('.editor').wysiwyg({
        classes: 'some-more-classes',
        placeholder: '请输入...',
        toolbar: 'top',
        buttons: {
            smilies: {
                title: 'Smilies',
                image: '\uf118', // <img src="path/to/image.png" width="16" height="16" alt="" />
                popup: function ($popup, $button) {
                    var list_smilies = [];
                    for (var i = 1; i < 75; i++) {
                        list_smilies.push('<img src="public/img/emotion/' + i + '.gif" width="16" height="16" alt="" />');
                    }
                    console.log(list_smilies);
                    var $smilies = $('<div/>').addClass('wysiwyg-toolbar-smilies')
                            .attr('unselectable', 'on');
                    $.each(list_smilies, function (index, smiley) {
                        if (index !== 0)
                            $smilies.append(' ');
                        var $image = $(smiley).attr('unselectable', 'on');
                        // Append smiley
                        var imagehtml = $('<div/>').append($image.clone()).html();
                        $image
                                .css({cursor: 'pointer'})
                                .click(function (event) {
                                    $('.editor').wysiwyg('shell').insertHTML(imagehtml); // .closePopup(); - do not close the popup
                                })
                                .appendTo($smilies);
                    });
                    var $container = $('.editor').wysiwyg('container');
                    $smilies.css({maxWidth: 300 + 'px'});
                    $popup.append($smilies);
                    // Smilies do not close on click, so force the popup-position to cover the toolbar
                    var $toolbar = $button.parents('.wysiwyg-toolbar');
                    if (!$toolbar.length) // selection toolbar?
                        return;
                    var left = 0,
                            top = 0,
                            node = $toolbar.get(0);
                    while (node)
                    {
                        left += node.offsetLeft;
                        top += node.offsetTop;
                        node = node.offsetParent;
                    }
                    left += parseInt(($toolbar.outerWidth() - $popup.outerWidth()) / 2);
                    if ($toolbar.hasClass('wysiwyg-toolbar-top'))
                        top -= $popup.height() - parseInt($button.outerHeight() * 1 / 4);
                    else
                        top += parseInt($button.outerHeight() * 3 / 4);
                    $popup.css({left: left + 'px',
                        top: top + 'px'
                    });
                    $('.wysiwyg-toolbar-smilies').click(function () {
                        $('.wysiwyg-popup').hide();
                    });
                    // prevent applying position
                    return false;
                }
                //showstatic: true,    // wanted on the toolbar
            },
            forecolor: {
                title: '字体颜色',
                image: '\uf1fc'
            },
            sendfile: {
                title: "上传图片",
                image: arguments[0],
                click: function ($button) {
                    $('#upload-image').click();
                },
                showstatic: true    // wanted on the toolbar
            },
            insertlink: {
                title: '插入链接',
                image: '\uf08e',
                showstatic: true
            },
            exchange: {
                title: "发送币值",
                image: arguments[1],
                click: function ($button) {

                },
                showstatic: true    // wanted on the toolbar
            }
        },
        submit: {
            title: 'Submit',
            image: '\uf00c' // <img src="path/to/image.png" width="16" height="16" alt="" />
        },
        dropfileclick: 'Drop image or click',
        placeholderUrl: 'http://',
        onImageUpload: function (insert_image) {
        },
        onKeyEnter: function () {
        }
    });

}

