"use strict";
var names = new Map();
let activeNames = [];
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
    const maybeAttribution = document.getElementById("attribution");
    const maybeFooter = document.getElementById("footer");
    function displayShuffledNames() {
        for (let i = 0; i < shuffledNames.length; i++) {
            const node = document.createElement("li");
            const textnode = document.createTextNode(shuffledNames[i]);
            node.appendChild(textnode);
            if (maybeMyList2)
                maybeMyList2.appendChild(node);
        }
    }
    if (maybeButton && maybeRandomizeButton && maybeNameInput && maybeCopyButton && maybeMyList && maybeClearAllButton && maybeMyList2 && maybeAttribution && maybeFooter) {
        chrome.storage.sync.get({ jsonNames: {}, activeNames: [], shuffledNames: [], pasteOnSameLine: false }, (items) => {
            console.log("items: ", items);
            names = new Map(Object.entries(items.jsonNames));
            console.log("names: ", names);
            if (names.size > 0) {
                maybeAttribution.style.display = "";
                for (let [name, isActive] of names) {
                    addName(name, false, isActive);
                }
            }
            else {
                maybeAttribution.style.display = "none";
                maybeFooter.style.minHeight = "";
                document.documentElement.style.height = "10rem";
            }
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
            chrome.storage.sync.set({ jsonNames: [], activeNames: [], shuffledNames: [] }).then(() => {
                names.clear();
                activeNames = [];
                maybeMyList.innerHTML = "";
                shuffledNames = [];
                maybeMyList2.innerHTML = "";
                maybeCopyButton.style.display = "none";
                maybeRandomizeButton.style.display = "none";
                maybeAttribution.style.display = "none";
                maybeFooter.style.minHeight = "0px";
                document.documentElement.style.height = "10rem"; // Should exist a better way to resize the window
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
        function addName(text, storageSync = true, isActive = true) {
            if (text.trim() == "") {
                return;
            }
            /**
             * Creating something like this:
             * <li>
             *    <div style="justify-content: space-between; display: flex;">
             *        <label>a</label>
             *        <label>
             *            <img src="eye_open.png" style="height: 25px; width: 25px;">
             *        </label>
             *        </div>
             * </li>
             */
            const htmlliElement = document.createElement("li");
            if (!isActive)
                htmlliElement.style.textDecoration = "line-through";
            const divElement = document.createElement("div");
            const label1 = document.createElement("label");
            const label2 = document.createElement("label");
            const eyeImg = document.createElement("img");
            const textnode = document.createTextNode(text);
            label1.appendChild(textnode);
            htmlliElement.appendChild(divElement);
            divElement.style.justifyContent = "space-between";
            divElement.style.display = "flex";
            divElement.appendChild(label1);
            eyeImg.src = isActive ? "eye_open.png" : "eye_closed.png";
            eyeImg.style.height = "25px";
            eyeImg.style.width = "25px";
            eyeImg.addEventListener('click', e => onToggleActive(e, text, htmlliElement));
            label2.appendChild(eyeImg);
            divElement.appendChild(label2);
            if (maybeMyList) {
                maybeMyList.appendChild(htmlliElement);
                if (maybeRandomizeButton && maybeRandomizeButton.style.display === "none") {
                    maybeRandomizeButton.style.display = "block";
                }
                names.set(text, isActive);
                if (isActive) {
                    activeNames = [...activeNames, text];
                }
                const jsonNames = Object.fromEntries(names);
                if (storageSync) {
                    chrome.storage.sync.set({
                        jsonNames: jsonNames,
                        activeNames: activeNames
                    });
                }
            }
            maybeAttribution.style.display = "";
            maybeFooter.style.minHeight = "40px";
            maybeNameInput.value = "";
        }
        function onToggleActive(event, name, htmlliElement) {
            const target = event.target;
            const oldState = names.get(name);
            names.set(name, !oldState);
            if (oldState) {
                const index = activeNames.indexOf(name);
                activeNames.splice(index, 1);
                target.src = "eye_closed.png";
                htmlliElement.style.textDecoration = "line-through";
            }
            else {
                activeNames = [...activeNames, name];
                target.src = "eye_open.png";
                htmlliElement.style.textDecoration = "";
            }
            const jsonNames = Object.fromEntries(names);
            chrome.storage.sync.set({
                jsonNames: jsonNames,
                activeNames: activeNames
            });
        }
        maybeRandomizeButton.addEventListener('click', function () {
            if (maybeCopyButton.style.display === "none") {
                maybeCopyButton.style.display = "block";
            }
            shuffledNames = shuffle(activeNames);
            const jsonNames = Object.fromEntries(names);
            chrome.storage.sync.set({ jsonNames: jsonNames, shuffledNames: shuffledNames }).then(() => {
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
f();
