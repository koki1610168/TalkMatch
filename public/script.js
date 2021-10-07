const socket = io('/')
const landingPage = "https://talk-match-survey.herokuapp.com/"



const myPeer = new Peer(undefined, {
    key: 'peerjs',
    secure: true,
    host: 'talk-match-server.herokuapp.com',
    port: 443
})

const peers = {}



const myAudio = document.createElement('audio')

myAudio.muted = true
navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then(stream => {
    addVideoStream(myAudio, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const audio = document.createElement('audio')
        call.on('stream', userVideoStream => {
            addVideoStream(audio, userVideoStream)
            
        })
        const waiting = document.getElementById("wait")
        waiting.style.display = "none"
        socket.emit("start", "Start")
        const end = Date.now() + 840000;
        countDown(end)
        changeBackgroundUS()
        changeBackgroundJP()
        sessionClose()
    })
    socket.on('user-connected', (userId, mydata) => {
        connectToNewUser(userId, stream)
    })
})


socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
    const end = document.getElementById("end")
    end.style.display = "block"
})
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, MYDATA)
})


socket.on("ready", (text) => {
    const h = document.getElementById("start")
    h.innerHTML = text
})

socket.on("text", (language) => {
    document.getElementById("lan").innerHTML = language;
})

socket.on("count", (msg) => {
    document.getElementById("start").innerHTML = msg;
})

socket.on("change-us", () => {
    document.body.style.background = "#f7f7f7 url(/images/us.png) center top/cover no-repeat"
})

socket.on("change-jp", () => {
    document.body.style.background = "#f7f7f7 url(/images/jp.png) center top/cover no-repeat"
})



//Redirect both user to the landing page
socket.on("bye", () => {
    location.href = landingPage
})




function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const audio = document.createElement('audio')
    call.on('stream', userVideoStream => {
        addVideoStream(audio, userVideoStream)
    })
    call.on('close', () => {
        audio.remove()
    })
    const waiting = document.getElementById("wait")
    waiting.style.display = "none"
    socket.emit("start", "Start")
    const end = Date.now() + 840000;
    countDown(end)
    changeBackgroundUS()
    changeBackgroundJP()
    sessionClose()
    peers[userId] = call
    
}
function addVideoStream(audio, stream) {
    audio.srcObject = stream
    audio.addEventListener('loadedmetadata', () => {
      audio.play()
    })
  }

function changeBackgroundUS() {
    socket.emit("background-us")
    socket.emit("lan", "Speak English!")
}

function changeBackgroundJP() {
    var log = () => {
        socket.emit("background-jp")
        socket.emit("lan", "Speak Japanese!")
    }
    setTimeout(log, 420000)
}

function addZero(num) {
    var ret;
    if( num < 10 ) { ret = "0" + num; }
    else { ret = num; }
    return ret;
 }

 function countDown(end) {
     var log = () => {
        var nowTime = Date.now();
        time = (end-nowTime)/1000
        m = addZero(Math.floor(time/60))
        s = addZero(Math.floor(time%60))
        msg = m + ":" + s
        socket.emit("time", msg)
     }
     setInterval(log,1000);
 }

function sessionClose() {
    var log = () => {
      socket.emit("quit")
    }
    setTimeout(log, 840000)
}
