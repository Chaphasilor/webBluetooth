var currentTemp;
var tempType;

function handleTemperatureChange(e) {
  let value = e.target.value;
  currentTemp = moveDecimal(value.getInt16(0, true), 2);
  console.log('Current Temp: ' + currentTemp + '°C');
  alert('Current Temp: ' + currentTemp + '°C');
}

function handleTemperatureTypeChange(e) {
  let value = e.target.value;
  tempType = parseTempType(value.getInt16(0, true));
  console.log('Temp Type: ' + tempType);
  alert('Temp Type: ' + tempType);
}

function getTemperature() {
  reconnect(0).then(_ => {
    characteristics['temperature'].addEventListener('characteristicvaluechanged', handleTemperatureChange);
    characteristics['temperature'].readValue()
    .catch(err => {
      console.log('Device might be disconnected');
      alert("Device might be disconnected, please wait a few seconds and try again!");
    });
  })
}

function getTemperatureType() {
  reconnect(0).then(_ => {
    characteristics['temperature_type'].addEventListener('characteristicvaluechanged', handleTemperatureTypeChange);
    characteristics['temperature_type'].readValue()
    .catch(err => {
      console.log('Device might be disconnected');
      alert("Device might be disconnected, please wait a few seconds and try again!");
    });
  })
}


function displayTemp() {
  console.log('Current Temp: ' + currentTemp + '°C');
  alert('Current Temp: ' + currentTemp + '°C');
}

function parseTempType(typeNumber) {
  let typeString;
  
  switch (typeNumber) {
    case 1:
      typeString = "Armpit";
      break;
    case 2:
      typeString = "Body (general)";
      break;
    case 3:
      typeString = "Ear (lobe)";
      break;
    case 4:
      typeString = "Finger";
      break;
    case 5:
      typeString = "Gastro-intestinal Tract";
      break;
    case 6:
      typeString = "Mouth";
      break;
    case 7:
      typeString = "Rectum";
      break;
    case 8:
      typeString = "Toe";
      break;
    case 9:
      typeString = "Tympanum (ear drum)";
      break;
    default:
      typeString = "Location not defined!";
  }
  
  return typeString;
}

function moveDecimal(number, digitsInFront) {
  var l = number.toString().length-digitsInFront;
  var v = number/Math.pow(10, l);
  return v;
}
