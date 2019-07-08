var characteristics = {'temperature': null, 'temperature_type': null, '000025cd-0000-1000-8000-00805f9b34fb': null, '0000d64c-0000-1000-8000-00805f9b34fb': null};
const primaryService = 'health_thermometer';
var bluetoothDevice = null;
var connection;
var service;
var attemptReconnect;

function scan() {
  return new Promise(function(resolve, reject) {
    
    let options = { filters: [{ services: [primaryService] }] };
    
    bluetoothDevice = null;
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(options)
    .then(device => {
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      resolve();
    })
    .catch(error => {
      reject('Argh! ' + error);
    });
    
  })
}

function connect() {
  return new Promise(function(resolve, reject) {
    
    console.log('Connecting to Bluetooth Device...');
    bluetoothDevice.gatt.connect()
    .then(cn => {
      console.log('> Bluetooth Device connected');
      connection = cn;
      attemptReconnect = true;
      resolve();
    })
    .catch(error => reject(error));
    
  })
}

function setService() {
  return new Promise(function(resolve, reject) {
    
    connection.getPrimaryService(primaryService)
    .then(s => {
      service = s;
      console.log('> Service saved');
      resolve();
    })
    
  })
}

function setCharacteristics() {
  return new Promise(function(resolve, reject) {
          
    reconnect(0).then(_ => {      
      service.getCharacteristic('temperature').then(c => { // temperature characteristic
        characteristics['temperature'] = c;
        service.getCharacteristic('temperature_type').then(c => { // temperature type characteristic
          characteristics['temperature_type'] = c;
          service.getCharacteristic('000025cd-0000-1000-8000-00805f9b34fb').then(c => { // LED characteristic
            characteristics['000025cd-0000-1000-8000-00805f9b34fb'] = c;
            service.getCharacteristic('0000d64c-0000-1000-8000-00805f9b34fb').then(c => { // gate characteristic
              characteristics['0000d64c-0000-1000-8000-00805f9b34fb'] = c;
              console.log("> Characteristics saved");
              resolve();
            })
            .catch(_ => { // Gate characteristic not defined
              console.log("> Characteristics saved (gate not available)");
              resolve();
            })
          })
        })
      })
    })
    
  })
}

function disconnect() {
  attemptReconnect = false;
  if (!bluetoothDevice) {
    console.log('> Bluetooth Device is already disconnected');
    return;
  }
  console.log('Disconnecting from Bluetooth Device...');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    console.log('> Bluetooth Device is already disconnected');
  }
}

function disconnected() {
  if (!bluetoothDevice) {
    return true;
  } else {
    return !bluetoothDevice.gatt.connected;
  }
}

function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  if (attemptReconnect) {
    console.log('> Bluetooth Device disconnected, attempting to reconnect');
    reconnect(0);
  }
}


function reconnect(retries) {
  return new Promise(function(resolve, reject) {
    
    if (!bluetoothDevice) {
      scan()
      .then(_ => connect()
        .then(_ => setService()
          .then(_ => setCharacteristics()
            .then(_ => resolve())
          )
        )
      )
      .catch(error => {
        console.error('Argh! ' + error);
        if (retries < 3) {
          reconnect(++retries).catch(err => console.log(err));
        } else {
          reject();
        }
      });
    } else {
      if (bluetoothDevice.gatt.connected) {
        console.log('> Bluetooth Device is already connected');
        resolve();
      } else {
        connect()
        .then(_ => setService()
          .then(_ => setCharacteristics()
            .then(_ => resolve())
          )
        )
        .catch(error => {
          console.error('Argh! ' + error);
          if (retries < 3) {
            reconnect(++retries).catch(err => console.log(err));
          } else {
            reject();
          }
        });
      }
    }
    
  })
}