const fs = require('fs');

function readConfigFile(fileName) {
  const data = fs.readFileSync(fileName, 'utf8').toString().split('\n');
  return data.reduce((config, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key] = value;
    }
    return config;
  }, {});
}

const Kafka = require('node-rdkafka');
const config = readConfigFile('client.properties');
config['group.id'] = 'node-group';

const consumer = new Kafka.KafkaConsumer(config, { 'auto.offset.reset': 'earliest' });

consumer.on('ready', () => {
  consumer.subscribe(['topic_0']);
  consumer.consume();
}).on('data', (message) => {
  const data = message.value.toString();
  console.log('Consumed message:', data);
});

consumer.connect();
