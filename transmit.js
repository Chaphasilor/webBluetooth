function parseBitsToString(bits) {
  return String.fromCharCode.apply(null, new Int8Array(bits));
}

function bitifyString(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function setCharacteristic(cId, string) {
  reconnect(0).then(_ => {
    characteristics[cId].writeValue(bitifyString(string)).then(_ => {
      console.log('Success!!!');
    })
    .catch(err => alert(err));
  })
  .catch(err => alert(err));
}

function ledOn() {
  setCharacteristic("000025cd-0000-1000-8000-00805f9b34fb", "on");
}

function ledOff() {
  setCharacteristic("000025cd-0000-1000-8000-00805f9b34fb", "off");
}

function triggerGate() {
  setCharacteristic("0000d64c-0000-1000-8000-00805f9b34fb", "trigger");
}