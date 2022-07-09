//TODO 良い感じナイズ
var isThreadOpened = false;
const classPrimary = ".p-workspace__primary_view";
const classSecondary = ".p-workspace__secondary_view";

function applyStyle(view){
    var ariaLabel = view.ariaLabel;
    //main window
    ariaLabel = ariaLabel.replace(/^Channel /,'')
    //thread pane
    ariaLabel = ariaLabel.replace(/^Thread in /,'')

    chrome.storage.sync.get(["options"], function(value) {
        for(regex in value.options){
            const re = new RegExp(regex);
            if (re.test(ariaLabel)) {
                view.style = value.options[regex];
            } else {
                view.style = ""
            }
        };
    });
}

function callback(mutationList, observer){
    onSlackLoad(mutationList[0].target);
    //subtree: trueではないので、↓でも可
    //onSlackLoad(observer.target);
}

function secondaryCallback(mutationList, observer){
    mutationList.forEach(function(mutation, index){
        if(mutation.addedNodes.length){
            //thread切り替え時、nodeの削除/追加が発生するため、追加されたnodeに対してstyleを適用
            applyStyle(mutation.addedNodes[0]);
        }
    })
}

function onThreadOpen(){
    const secondaryView = document.querySelector(classSecondary)
    secondaryObserver = new MutationObserver(secondaryCallback);
    applyStyle(secondaryView.firstChild.firstChild);//for initially opened channel.
    //secondaryViewの孫のattribute変化を追いかけたい。しかし、threadを切り替えると毎回孫が消される。
    //孫をobserveしても意味がないし、子をobserveするしかない。しかし孫は生成時に最初からaria-labelが付与されているから、attributesの通知がこない。(もっと遠い子孫のariaLabelが一応変更通知くるけど)
    //secondaryObserver.observe(secondaryView, {attributes: true, subtree: true, attributeFilter: ["aria-label"]});
    //孫の生成通知を受け取るのが正確っぽい。
    secondaryObserver.observe(secondaryView.firstChild, {childList: true});
}

function onSlackLoad(){
    //main screen
    const primaryView = document.querySelector(classPrimary);
    const primaryObserver = new MutationObserver(callback);
    applyStyle(primaryView);//for initially opened channel.
    primaryObserver.observe(primaryView, {attributes: true, attributeFilter: ["aria-label"]});

    //thread scree
    const layoutView = document.querySelector('.p-workspace-layout');
    //最初からthread pane開いている場合
    if(!isThreadOpened && document.querySelector(classSecondary)) {
        isThreadOpened = true;
        onThreadOpen();
    }
    //以降はworkspace-layoutを監視
    const layoutObserver = new MutationObserver(function (mutationList, observer) {
        if(!isThreadOpened && document.querySelector(classSecondary)){
            isThreadOpened = true;
            onThreadOpen();
        }else if (isThreadOpened && !document.querySelector(classSecondary)){
            isThreadOpened = false;
            //observe will be disconnected automatically.(ref. MDN Web Docs)
            //https://developer.mozilla.org/ja/docs/Web/API/MutationObserver/disconnect#%E4%BD%BF%E7%94%A8%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E6%B3%A8%E6%84%8F%E7%82%B9
        }
    })
    layoutObserver.observe(layoutView, {
        childList: true
        , attributes: false
        , characterData: false
    })
}

const mainObserver = new MutationObserver(function (mutationList, observer) {
    if (document.querySelector(classPrimary)) {
        onSlackLoad();
        observer.disconnect()
    }
})

mainObserver.observe(document.body, {
    childList: true
    , subtree: true
    , attributes: false
    , characterData: false
})
