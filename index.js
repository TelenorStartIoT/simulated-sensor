/**
 * Last inn bibliotek som gjør det lettere å
 * sette opp en MQTT-klient mot MIC.
 */
var awsIot = require('aws-iot-device-sdk');

/**
 * Simuler data fra tingen med dette navnet
 * i MIC.
 * 
 * NB: Hvis dette byttes må man laste ned
 * sertifikat-filer (nøkler) for den nye tingen
 * og plassere dem i /certs -mappen likt det
 * allerede er blitt gjort.
 */
var THING_NAME = '00000022';

/**
 * Her konstruerer vi en topic som peker på vår
 * ting i MIC, og som meldinger vil bli sendt til.
 */
var MQTT_TOPIC = '$aws/things/' + THING_NAME + '/shadow/update';

/**
 * Her lager vi en MQTT klient konfigurert
 * for å snakke mot MIC, og bruker våre
 * nøkler som vi lastet ned fra MIC dashboard.
 */
var MQTT = awsIot.device({
   keyPath: './certs/' + THING_NAME + '/privkey.pem',       // Lastes ned fra MIC dashboard
  certPath: './certs/' + THING_NAME + '/cert.pem',          // Lastes ned fra MIC dashboard
    caPath: './certs/ca.pem',                               // Amazon Root CA 1, lastes ned fra (allerede gjort):
                                                            //  https://docs.aws.amazon.com/iot/latest/developerguide/managing-device-certs.html
  clientId: THING_NAME,                                     // Unikt navn for vår MQTT klient
      host: 'a15nxxwvsld4o-ats.iot.eu-west-1.amazonaws.com' // Host/MQTT-broker som brukes av MIC
});

/**
 * Kjør dette så fort MQTT-klienten har koblet
 * seg på. Det vi har lyst til er å begynne sende
 * simulerte meldinger periodisk.
 */
MQTT.on('connect', () => {
  console.log('Client connected! Starting to simulate messages.');
  setInterval(sendSimulatedMessage, 5000); // Send ny melding hvert 5 sekund
});

/**
 * Funksjon for å sende en simulert melding
 * over MQTT. Denne funksjonen kalles periodisk
 * etter at MQTT-klienten har koblet seg opp.
 */
function sendSimulatedMessage () {

  /**
   * Meldingen som blir sendt. Her sender vi på
   * state > reported -seksjonen som vil si at
   * MIC ser dette som en melding fra en fysisk
   * ting.
   */
  var message = JSON.stringify({
    state: {
      reported: {

        /**
         * Her genererer vi den simulerte
         * dataen. Hvert felt vil bli en
         * MIC "ressurs" som man kan lage
         * "widgets" av i dashboardet.
         */
        temperature:  randomNumberBetween(0, 45),
        humidity:     randomNumberBetween(0, 45),
        latlng:       '59.9045' + Math.floor(randomNumberBetween(0, 99)) +',10.6574' + Math.floor(randomNumberBetween(0, 99)),
        switch_state: Math.round(Math.random())
      }
    }
  });

  /**
   * Nå sender vi meldingen vha. MQTT sin
   * "publish". Vi kan så sjekke om meldingen
   * ble sendt eller om det oppsto en feil.
   */
  MQTT.publish(MQTT_TOPIC, message, (err) => {
    if (err) {
      console.log('Got error:', e);
    } else {
      console.log('Sent a simulated message to the topic '+ MQTT_TOPIC + '!');
      console.log('Message: ', message);
    }
  });
}

/**
 * Funksjon for å generere et random tall
 * mellom `min` og `max`.
 */
function randomNumberBetween (min, max) {
  return min + Math.random() * (max - min);
}
