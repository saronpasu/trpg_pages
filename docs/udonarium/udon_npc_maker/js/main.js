
// default values
var char_name = null;
var char_size = 1;
var place = 'table';
var dicebot = '';
var chat_pallet = '';
var char_image = null;
var x_pos = 0;
var y_pos = 0;
var z_pos = 0;
var rotate = 0;
var roll = 0;
var imageIdentifier = null;
var imageData = null;
var imageSuffix = null;
var imageFileName = null;

var xml;
var zip;
var message = '';
var isValid = false;

function createDiceBotElement(gameType, gameName) {
    var elem = document.createElement('option');
    elem.setAttribute('value', gameType);
    elem.innerText = gameName;
    return elem;
};

function setDiceBot() {
    var target = document.getElementById('dicebot');

    for(var i=0; i < dicebotlist.length; i++) {
        var gameType = dicebotlist[i][0];
        var gameName = dicebotlist[i][1];
        var elem = createDiceBotElement(gameType, gameName);
        target.appendChild(elem);
    }
};

function changeImage() {
    drawPreview();
};

function clearImage() {
    var elem = document.getElementById('image_file');
    elem.value = '';
    var elem = document.getElementById('image_preview');
    elem.setAttribute('hidden', '');
};

function drawPreview() {
    var elem = document.getElementById('image_file');
    var file = elem.files[0];
    var preview = document.getElementById('image_preview');
    var reader = new FileReader();

    reader.onload = function() {
        preview.src = reader.result;
    }
    reader.readAsDataURL(file);
    preview.removeAttribute('hidden');
};

function checkRefect() {
    var elem = document.getElementById('x_lotate');
    var x_lotate = false;
    var y_lotate = false;
    if(elem.checked) {
        x_lotate = true;
    }
    var elem = document.getElementById('y_lotate');
    if(elem.checked) {
        y_lotate = true;
    }
    var preview = document.getElementById('image_preview');

    if(x_lotate && !y_lotate) {
        preview.setAttribute('class', 'refrect-lr');
        rotate = -180;
        roll = 0;
    }else if (!x_lotate && y_lotate) {
        preview.setAttribute('class', 'refrect-ud');
        rotate = 0;
        roll = 180;
    }else if (x_lotate && y_lotate) {
        preview.setAttribute('class', 'refrect-udlr');
        rotate = -180;
        roll = 180;
    }else{
        preview.setAttribute('class', 'no-refrect');
        rotate = 0;
        roll = 0;
    }
};

function setRefect() {
    checkRefect();
};

async function validCheck() {
    var messages = [];

    if(char_name == '' || char_name == null) {
        // not valid.
        messages.push('名前を入力してください');
    }
    if(isNaN(char_size) || char_size < 0) {
        // not valid.
        messages.push('サイズが正しくありません');
    }
    if(place == '' || place == null) {
        // not valid.
        messages.push('配置先が正しくありません')
    }
    if(isNaN(x_pos) || x_pos < 0) {
        // not valid.
        messages.push('X座標が正しくありません');
    }
    if(isNaN(y_pos) || y_pos < 0) {
        // not valid.
        messages.push('Y座標が正しくありません');
    }
    if(isNaN(z_pos) || z_pos < 0) {
        // not valid.
        messages.push('Z座標が正しくありません');
    }
    if(isNaN(rotate)) {
        // not valid.
        messages.push('回転軸(横)が正しくありません');
    }
    if(isNaN(roll)) {
        // not valid.
        messages.push('回転軸(縦)が正しくありません');
    }
    if(dicebot == null) {
        // not valid.
        messages.push('ダイスボットの設定が正しくありません');
    }
    if(chat_pallet == null) {
        // not valid.
        messages.push('チャットパレット本文が正しくありません');
    }

    if(messages.length == 0) {
        isValid = true;
    }

    if(messages.length != 0) {
        for(var i=0; i<messages.length; i++) {
            sendMessage(messages[i], 'error');
            await wait(1000);
        }
    }

    await wait(2000);
    clearMessage();

    isValid = false;
};

function hasImage() {
    var elem = document.getElementById('image_file');
    return (elem.files.length != 0);
};

async function refreshData() {
    elem = document.getElementById('char_name');
    char_name = elem.value;
    elem = document.getElementById('char_size');
    char_size = parseFloat(elem.value);
    elem = document.getElementById('place');
    place = elem.value;
    elem = document.getElementById('x_pos');
    x_pos = parseInt(elem.value);
    elem = document.getElementById('y_pos');
    y_pos = parseInt(elem.value);
    elem = document.getElementById('z_pos');
    z_pos = parseInt(elem.value);
    elem = document.getElementById('dicebot');
    dicebot = elem.value;
    elem = document.getElementById('chat_pallet');
    chat_pallet = elem.value;

    checkRefect();

    if(hasImage()) {
        getImageIdentifier();
        getImageData();
        getImageSuffix();

        await wait(1000);
        imageFileName = imageIdentifier + imageSuffix;
    }
};

const wait = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

function sendMessage(message, type) {
    var message_area = document.getElementById('message_area');
    var elem = document.createElement('div');
    if(type == 'normal') {
        elem.setAttribute('class', 'normal_message');
    }else if (type == 'error') {
        elem.setAttribute('class', 'error_message');
    }

    elem.innerText = message;

    message_area.appendChild(elem);

};

function clearMessage() {
    var message_area = document.getElementById('message_area');
    message_area.innerText = '';
};

function getImageIdentifier() {
    var elem = document.getElementById('image_file');
    file = elem.files[0];

    var reader = new FileReader();
    reader.onload = function() {
        var data = reader.result;

        var wordArray = CryptoJS.lib.WordArray.create(data);
        var result = CryptoJS.SHA256(wordArray).toString();
        imageIdentifier = result;
    }

    reader.readAsArrayBuffer(file);
};

function createXML() {
    var result = '';
    result += `<?xml version="1.0" encoding="UTF-8"?>`+"\n";
    result += `<character location.name="${place}" location.x="${x_pos}" location.y="${y_pos}" posZ="${z_pos}" rotate="${rotate}" roll="${roll}">`+"\n";
    result += `  <data name="character">`+"\n";
    result += `    <data name="image">`+"\n";
    result += `      <data type="image" name="imageIdentifier">${imageIdentifier}</data>`+"\n";
    result += `    </data>`+"\n";
    result += `    <data name="common">`+"\n";
    result += `      <data name="name">${char_name}</data>`+"\n";
    result += `      <data name="size">${char_size}</data>`+"\n";
    result += `    </data>`+"\n";
    result += `    <data name="detail"></data>`+"\n";
    result += `  </data>`+"\n";
    result += `  <chat-palette dicebot="${dicebot}">`+"\n";
    result += chat_pallet+"\n";
    result += `</chat-palette>`+"\n";
    result += `</character>`+"\n";

    xml = result;
};

function getImageSuffix() {
    var elem = document.getElementById('image_file');
    imageSuffix = elem.files[0].name.match(/\..+$/)[0];
};

function getImageData() {
    var elem = document.getElementById('image_file');
    var file = elem.files[0];
    var reader = new FileReader();

    reader.onload = function() {
        imageData = reader.result;
    }
    reader.readAsArrayBuffer(file);
};

function createZip() {
    var zip_container = new JSZip();
    zip_container.file('data.xml', xml);
    zip_container.file(
        imageFileName,
        imageData,
        {binary: true}
    );

    zip = zip_container;
};

function downloadZip() {
    zip.generateAsync({type:'blob'})
    .then(function(blob) {
        saveAs(blob, `${char_name}.zip`);
    });
};

async function generateCharactor() {
    refreshData();
    validCheck();
    if(!isValid) {
        return false;
    }

    if(hasImage()) {
        await wait(1500);
    }

    createXML();
    createZip();
    downloadZip();
};

window.onload = function() {
    setDiceBot();
    var image_input = document.getElementById('image_file');
    image_input.addEventListener('change', changeImage, false);
    var x_lotate = document.getElementById('x_lotate');
    x_lotate.addEventListener('change', setRefect, false);
    var y_lotate = document.getElementById('y_lotate');
    y_lotate.addEventListener('change', setRefect, false);
};

