"use strict";
let names = [];
let shuffledNames = [];
let pasteOnSameLine = false;
function f() {
    const maybeButton = document.getElementById('button');
    const maybeRandomizeButton = document.getElementById('randomize');
    const maybeCopyButton = document.getElementById('copy');
    const maybeClearAllButton = document.getElementById('cookie');
    const maybeNameInput = document.getElementById('nameInput');
    const maybeMyList = document.getElementById("myList");
    const maybeMyList2 = document.getElementById("myList2");
    function displayShuffledNames() {
        for (let i = 0; i < shuffledNames.length; i++) {
            const node = document.createElement("li");
            const textnode = document.createTextNode(shuffledNames[i]);
            node.appendChild(textnode);
            if (maybeMyList2)
                maybeMyList2.appendChild(node);
        }
    }
    if (maybeButton && maybeRandomizeButton && maybeNameInput && maybeCopyButton && maybeMyList && maybeClearAllButton && maybeMyList2) {
        chrome.storage.sync.get({ names: [], shuffledNames: [], pasteOnSameLine: false }, (items) => {
            items.names.map((name) => addName(name, false));
            shuffledNames = items.shuffledNames;
            if (shuffledNames.length > 0) {
                displayShuffledNames();
                if (maybeCopyButton.style.display === "none") {
                    maybeCopyButton.style.display = "block";
                }
            }
            pasteOnSameLine = items.pasteOnSameLine;
        });
        maybeClearAllButton.addEventListener('click', function () {
            chrome.storage.sync.set({ names: [], shuffledNames: [] }).then(() => {
                names = [];
                maybeMyList.innerHTML = "";
                shuffledNames = [];
                maybeMyList2.innerHTML = "";
                maybeCopyButton.style.display = "none";
                maybeRandomizeButton.style.display = "none";
                document.documentElement.style.height = "11rem";
            });
        });
        maybeButton.addEventListener('click', function () {
            let text = maybeNameInput.value;
            addName(text);
        });
        maybeNameInput.onkeydown = function (e) {
            if (e.code == "Enter") {
                let text = maybeNameInput.value;
                addName(text);
            }
        };
        function addName(text, storageSync = true) {
            if (text.trim() == "") {
                return;
            }
            const node = document.createElement("li");
            const textnode = document.createTextNode(text);
            node.appendChild(textnode);
            if (maybeMyList) {
                maybeMyList.appendChild(node);
                if (maybeRandomizeButton && maybeRandomizeButton.style.display === "none") {
                    maybeRandomizeButton.style.display = "block";
                }
                names = [...names, text];
                if (storageSync) {
                    chrome.storage.sync.set({ names: names });
                }
            }
            maybeNameInput.value = "";
        }
        maybeRandomizeButton.addEventListener('click', function () {
            if (maybeCopyButton.style.display === "none") {
                maybeCopyButton.style.display = "block";
            }
            shuffledNames = shuffle(names);
            chrome.storage.sync.set({ names: names, shuffledNames: shuffledNames }).then(() => {
                maybeMyList2.innerHTML = "";
                displayShuffledNames();
            });
        });
        maybeCopyButton.addEventListener('click', function () {
            const shuffledNamesString = arrayToString(shuffledNames);
            console.log(shuffledNamesString);
            navigator.clipboard.writeText(shuffledNamesString).then(function () {
                console.log('Async: Copying to clipboard was successful!');
                window.close();
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        });
        function arrayToString(arr) {
            let newArr = [];
            if (pasteOnSameLine) {
                newArr = arr.map((e, i) => (i + 1) + ". " + e);
                return newArr.join(", ");
            }
            else {
                newArr = arr.map((e, i) => (i + 1) + ". " + e);
                return newArr.join("\n");
            }
        }
    }
}
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function setCookie2(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    chrome.cookies.set({
        "name": "Sample1",
        "url": "chrome://extensions",
        "value": "Dummy Data"
    }, function (cookie) {
        console.log(JSON.stringify(cookie));
        console.log(chrome.extension.lastError);
        console.log(chrome.runtime.lastError);
    });
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getNamesFromCookie() {
    let storedNames = [];
    let name1 = getCookie("name1");
    if (name1 != "") {
        storedNames[0] = name1;
    }
    return storedNames;
}
f();
