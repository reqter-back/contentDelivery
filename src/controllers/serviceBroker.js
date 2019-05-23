var amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');
var EventEmitter = require('events');

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
var rabbitHost = process.env.RABBITMQ_HOST || "amqp://gvgeetrh:6SyWQAxDCpcdg1S0Dc-Up0sUxfmBUVZU@chimpanzee.rmq.cloudamqp.com/gvgeetrh";
//var rabbitHost = process.env.RABBITMQ_HOST || "amqp://localhost:15672";

var amqpConn = null;
function startconnect(){
  console.log('Start connecting');
  amqp.connect(rabbitHost, (err, conn)=>{
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(startconnect, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      //return setTimeout(start, 1000);
    });

    console.log("[AMQP] connected");
    amqpConn = conn;

    whenConnected();
  });
}
exports.start = ()=> {
  startconnect();
}

function whenConnected() {
  amqpConn.createChannel( (err, ch) => {
      if (err) {
          console.error("[AMQP]", err.message);
          //return setTimeout(this.startconnect, 1000);
          }
          ch.on("error", function(err) {
          console.error("[AMQP] channel error", err.message);
          //return setTimeout(this.startconnect, 1000);
          });
          ch.on("close", function() {
          console.log("[AMQP] channel closed");
          //return setTimeout(this.startconnect, 1000);
          });
          // create an event emitter where rpc responses will be published by correlationId
          ch.responseEmitter = new EventEmitter();
          ch.responseEmitter.setMaxListeners(0);
          ch.consume(REPLY_QUEUE,
              (msg) => ch.responseEmitter.emit(msg.properties.correlationId, msg.content),
              {noAck: true});
          channel = ch;
          return ch;
      });
}
 var channel = undefined;

exports.sendRPCMessage = (message, rpcQueue) => new Promise((resolve) => {
  const correlationId = uuidv4();
  // listen for the content emitted on the correlationId event
  channel.responseEmitter.once(correlationId, resolve);
  channel.sendToQueue(rpcQueue, new Buffer.from(JSON.stringify(message)), { correlationId, replyTo: REPLY_QUEUE })
});

exports.publishMessage = (message, queue) => new Promise((resolve) => {
  const correlationId = uuidv4();
  // listen for the content emitted on the correlationId event
  channel.responseEmitter.once(correlationId, resolve);
  channel.sendToQueue(rpcQueue, new Buffer.from(JSON.stringify(message)), { correlationId, replyTo: REPLY_QUEUE })
});