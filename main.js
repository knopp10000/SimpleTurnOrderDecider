"use strict";
var names = new Map();
let activeNames = [];
let shuffledNames = [];
let pasteOnSameLine = false;
function f() {
    const maybeAddButton = document.getElementById('button');
    const maybeRandomizeButton = document.getElementById('randomize');
    const maybeCopyButton = document.getElementById('copy');
    const maybeClearAllButton = document.getElementById('cookie');
    const maybeNameInput = document.getElementById('nameInput');
    const maybeMyList = document.getElementById("myList");
    const maybeMyList2 = document.getElementById("myList2");
    const maybeAttribution = document.getElementById("attribution");
    const maybeAttribution2 = document.getElementById("attribution2");
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
    /**
     * Update the store data with the current names and active names.
     */
    function updateStoreData() {
        const jsonNames = Object.fromEntries(names);
        chrome.storage.sync.set({
            jsonNames: jsonNames,
            activeNames: activeNames
        });
    }
    if (maybeAddButton && maybeRandomizeButton && maybeNameInput && maybeCopyButton && maybeMyList && maybeClearAllButton && maybeMyList2 && maybeAttribution && maybeAttribution2 && maybeFooter) {
        chrome.storage.sync.get({ jsonNames: {}, activeNames: [], shuffledNames: [], pasteOnSameLine: false }, (items) => {
            console.log("items: ", items);
            names = new Map(Object.entries(items.jsonNames));
            console.log("names: ", names);
            if (names.size > 0) {
                maybeAttribution.style.display = "";
                maybeAttribution2.style.display = "";
                for (let [name, isActive] of names) {
                    addName(name, false, isActive);
                }
            }
            else {
                maybeAttribution.style.display = "none";
                maybeAttribution2.style.display = "none";
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
                maybeAttribution2.style.display = "none";
                maybeFooter.style.minHeight = "0px";
                document.documentElement.style.height = "10rem"; // Should exist a better way to resize the window
            });
        });
        maybeAddButton.addEventListener('click', function () {
            let text = maybeNameInput.value;
            addName(text);
        });
        maybeNameInput.onkeydown = function (e) {
            if (e.code == "Enter") {
                let text = maybeNameInput.value;
                addName(text);
            }
        };
        function addName(name, storageSync = true, isActive = true) {
            if (name.trim() == "") {
                return;
            }
            if (!maybeMyList) {
                console.error("myList is null");
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
            const rightmostContainer = document.createElement("div");
            const nameTextLabel = document.createElement("label");
            const eyeLabel = document.createElement("label");
            const eyeImg = document.createElement("img");
            const redXLabel = document.createElement("label");
            const redXImg = document.createElement("img");
            // Left Side - Name
            const nameTextNode = document.createTextNode(name);
            nameTextLabel.appendChild(nameTextNode);
            //Right Side - Eye and X
            // Eye
            eyeImg.src = isActive ? "./assets/eye_open.png" : "./assets/eye_closed.png";
            eyeImg.style.height = "20px";
            eyeImg.style.width = "20px";
            eyeImg.addEventListener('click', e => onToggleActive(e, name, htmlliElement));
            eyeLabel.appendChild(eyeImg);
            rightmostContainer.appendChild(eyeLabel);
            // Red X
            redXImg.src = "./assets/redX.png";
            redXImg.style.height = "20px";
            redXImg.style.width = "20px";
            redXImg.addEventListener('click', e => onDeleteName(name, htmlliElement));
            redXLabel.appendChild(redXImg);
            rightmostContainer.appendChild(redXLabel);
            // Appending everything to li
            divElement.style.justifyContent = "space-between";
            divElement.style.display = "flex";
            divElement.appendChild(nameTextLabel);
            divElement.appendChild(rightmostContainer);
            htmlliElement.appendChild(divElement);
            maybeMyList.appendChild(htmlliElement);
            if (maybeRandomizeButton && maybeRandomizeButton.style.display === "none") {
                maybeRandomizeButton.style.display = "block";
            }
            names.set(name, isActive);
            if (isActive) {
                activeNames = [...activeNames, name];
            }
            const jsonNames = Object.fromEntries(names);
            if (storageSync) {
                chrome.storage.sync.set({
                    jsonNames: jsonNames,
                    activeNames: activeNames
                });
            }
            maybeAttribution.style.display = "";
            maybeAttribution2.style.display = "";
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
                target.src = "./assets/eye_closed.png";
                htmlliElement.style.textDecoration = "line-through";
            }
            else {
                activeNames = [...activeNames, name];
                target.src = "./assets/eye_open.png";
                htmlliElement.style.textDecoration = "";
            }
            updateStoreData();
        }
        function onDeleteName(name, htmlliElement) {
            console.log("trying to delete name: ", name);
            names.delete(name);
            htmlliElement.remove();
            const index = activeNames.indexOf(name);
            activeNames.splice(index, 1);
            updateStoreData();
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
