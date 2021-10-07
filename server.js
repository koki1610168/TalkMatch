const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb+srv://koki:1610168@cluster0.os1o9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const port = process.env.PORT || 4000;

//var mydata = {"name": "koki", "nationality": "JP"}

app.set('view engine', 'ejs')
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.render('start.ejs')
})

app.get('/instruction', (req, res) => {
  res.render('instruction.ejs')
})
app.get('/instruction-jp', (req, res) => {
  res.render('instruction-jp.ejs')
})

app.get('/en', (req, res) => {
  res.render('index.ejs')
})

app.get('/jp', (req, res) => {
  res.render('index-jp.ejs')
})

app.get('/findMake', (req, res) => {
  res.render('findMake.ejs')
})

app.get('/findMake-jp', (req, res) => {
  res.render('findMake-jp.ejs')
})

app.get('/choose', (req, res) => {
  res.render('choose.ejs')
})

app.get('/choose-jp', (req, res) => {
  res.render('choose-jp.ejs')
})



app.post('/makeRoom', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    const roomId = `${uuidV4()}`
    req.body.roomId = roomId
    req.body.native = "English"
    collection
      .insertOne(req.body)
      .then(() => {
        res.redirect(`/${roomId}`)
      })
      .catch(() => {
        res.redirect('/find');
      });
  });
});

app.post('/makeRoom-jp', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    const roomId = `${uuidV4()}`
    req.body.roomId = roomId
    req.body.native = "Japanese"
    collection
      .insertOne(req.body)
      .then(() => {
        res.redirect(`/${roomId}`)
      })
      .catch(() => {
        res.redirect('/find');
      });
  });
});

app.get('/find', (req, res) => {
  MongoClient.connect(dbUrl, {useUnifiedTopology: true}, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo')
    const collection = db.collection('users');
    collection
        .find()
        .toArray()
        .then((results) => {
            res.render('find.ejs', {users: results})

        })
        .catch((error) => {
            res.redirect('/')
        })
})
})

app.delete('/find', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
      if (err) return console.error(err);
      const db = client.db('node-demo');
      const collection = db.collection('users');
      collection
          .deleteOne(req.body)
          .then(() => {
              res.json(`Deleted user`);
          })
          .catch(() => {
              res.redirect('/');
          });
  });
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, mydata: "Koki"})
})


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, mydata) => {
      socket.join(roomId)
      socket.broadcast.to(roomId).emit('user-connected', userId, mydata)

      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)

      })
      socket.on("start", (text) => {
        socket.broadcast.to(roomId).emit('ready', text)
      })

      socket.on("lan", (language) => {
        socket.broadcast.to(roomId).emit('text', language)
      })
      
      socket.on("time", (msg) => {
        socket.broadcast.to(roomId).emit('count', msg)
      })

      socket.on("background-us", () => {
        socket.broadcast.to(roomId).emit('change-us')
      })

      socket.on("background-jp", () => {
        socket.broadcast.to(roomId).emit('change-jp')
      })
      socket.on('emoji1', (expression1) => {
        socket.broadcast.to(roomId).emit('face1', expression1)
      })
      socket.on('emoji2', (expression2) => {
        socket.broadcast.to(roomId).emit('face2', expression2)
      })
  
      socket.on("quit", () => {
        socket.broadcast.to(roomId).emit('bye')
      })
  })
})

server.listen(port)
