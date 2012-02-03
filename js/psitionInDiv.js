function js_countTextAreaChars(text) {
    var n = 0;
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) != ‘\r’) {
            n++;
        }
    }
    return n;
}

function js_CursorPos(start, end) {
    this.start = start;
    this.end = end;
}

function js_getCursorPosition(textArea) {
    var start = 0;
    var end = 0;
    if (document.selection) { // IE…
        textArea.focus();
        var sel1 = document.selection.createRange();
        var sel2 = sel1.duplicate();
        sel2.moveToElementText(textArea);
        var selText = sel1.text;
        sel1.text = “01″;
        var index = sel2.text.indexOf(“01″);
        start = js_countTextAreaChars((index == -1) ? sel2.text : sel2.text.substring(0, index));
        end = js_countTextAreaChars(selText) + start;
        sel1.moveStart(‘character’, -1);
        sel1.text = selText;
    } else if (textArea.selectionStart || (textArea.selectionStart == “0″)) { // Mozilla/Netscape…
        start = textArea.selectionStart;
        end = textArea.selectionEnd;
    }
    return new js_CursorPos(start, end);
}

function js_setCursorPosition(textArea, cursorPos) {
    if (document.selection) { // IE…
        var sel = textArea.createTextRange();
        sel.collapse(true);
        sel.moveStart(“character”, cursorPos.start);
        sel.moveEnd(“character”, cursorPos.end – cursorPos.start);
        sel.select();
    } else if (textArea.selectionStart || (textArea.selectionStart == “0″)) { // Mozilla/Netscape…
        textArea.selectionStart = cursorPos.start;
        textArea.selectionEnd = cursorPos.end;
    }
    textArea.focus();
}
