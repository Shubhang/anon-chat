const { expect } = require('chai');
const io = require('socket.io-client');
const { server, resetChannels } = require('../app');

const socketURL = 'http://localhost:3000';

function createSocketClient() {
  return io.connect(socketURL, {
    transports: ['websocket'],
    forceNew: true,
  });
}

describe('Chat Application', () => {
  let client1, client2;

  beforeEach((done) => {
    resetChannels();
    client1 = createSocketClient();
    client2 = createSocketClient();
    done();
  });

  afterEach((done) => {
    client1.disconnect();
    client2.disconnect();
    done();
  });

  it('should not broadcast messages to clients in different channels', (done) => {
    const channel1 = 'general';
    const channel2 = 'tech';
    const message = 'Hello, world!';

    client1.emit('join channel', channel1);
    client2.emit('join channel', channel2);

    client1.emit('chat message', { channel: channel1, msg: message });

    client2.on('chat message', (msg) => {
      expect(msg).to.not.equal(message);
      done(new Error('Received message from different channel'));
    });

    setTimeout(() => {
      done();
    }, 500);
  });

  it('should send message history to new clients joining a channel', (done) => {
    const channel = 'general';
    const message1 = 'Welcome!';
    const message2 = 'How are you?';

    client1.emit('join channel', channel);

    client1.emit('chat message', { channel, msg: message1 });
    client1.emit('chat message', { channel, msg: message2 });

    client2.emit('join channel', channel);

    client2.on('message history', (msgs) => {
      expect(msgs).to.deep.equal([message1, message2]);
      done();
    });
  });
});
