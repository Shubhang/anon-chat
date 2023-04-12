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

io.on('connection', (socket) => {
    console.log('User connected');
    
    // Send message history to the new user
    socket.emit('message history', messages);
  
    // Broadcast message to all other clients
    socket.on('chat message', (msg) => {
      // Save message to the messages array
      messages.push(msg);
  
      // Limit the number of stored messages to a specific value (e.g., 100)
      if (messages.length > 100) {
        messages.shift();
      }
  
      socket.broadcast.emit('chat message', msg);
    });
  
    // Handle user disconnecting
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  
  