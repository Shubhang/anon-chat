const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Home page route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const messages = [];

const channels = {
  general: [],
  tech: [],
  random: [],
  // Add more channels as needed
};

// Add this function in app.js
function resetChannels() {
  channels.general = [];
  channels.tech = [];
  channels.random = [];
  // Reset other channels as needed
}

// Export the function along with the server
module.exports = { server, resetChannels };


io.on('connection', (socket) => {
  console.log('User connected');

  // Handle user joining a channel
  socket.on('join channel', (channel) => {
    socket.join(channel);
    socket.emit('message history', channels[channel]);
  });

  // Broadcast message to all clients in the channel
  socket.on('chat message', (data) => {
    const { channel, msg } = data;
    channels[channel].push(msg);

    // Limit the number of stored messages per channel
    if (channels[channel].length > 100) {
      channels[channel].shift();
    }

    socket.to(channel).emit('chat message', msg);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

  