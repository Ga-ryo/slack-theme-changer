//TODO なんか規模を大きくするならちゃんとしたコードにする(が、ただのoptionだしええやろ感)(シンプルが一番！w)
const q = (x)=>{return document.querySelector(x);}
const qA = (x)=>{return document.querySelectorAll(x);}
const br = ()=>{return document.createElement('br')}
const nbsp = ()=>{return document.createTextNode(' ')}

function deleteOption(e){
    e.target.parentNode.remove();
}
function insertOption(channelRegex, style){
    var p = document.createElement("p");
    regexInput = document.createElement("input");
    regexInput.setAttribute("class", "channelRegex")
    regexInput.className = "channelRegex"
    regexInput.type = "text"
    regexInput.placeholder = ".*shared.*"
    regexInput.value = channelRegex
    styleInput = document.createElement("input");
    styleInput.className = "style"
    styleInput.type = "text"
    styleInput.placeholder = "color: red"
    styleInput.value = style
    deleteButton = document.createElement("input");
    deleteButton.className = "delete"
    deleteButton.type = "button"
    deleteButton.value = "削除"
    deleteButton.onclick = deleteOption;
    p.appendChild(regexInput)
    p.appendChild(nbsp())
    p.appendChild(styleInput)
    p.appendChild(deleteButton)
    q("#registerForm").appendChild(p)
}
$(function(){
    q("#add").onclick = function () {
        insertOption('','');
    };

    q("#save").onclick = function () {
        const regexArray = qA(".channelRegex");
        const styleArray = qA(".style");
        const options = {}
        regexArray.forEach(function (regex, index){
            if(regex.value) {
                options[regex.value] = styleArray[index].value;
            }
        })
        chrome.storage.sync.set({"options": options});
        window.close();
    };

    // オプション画面の初期値を設定する
    chrome.storage.sync.get(["options"], function(value) {
        for(regex in value.options){
            insertOption(regex, value.options[regex]);
        }
    });
});
