// Initialize the socket
const socket = io('/');

// Get the video grid element and create a video element
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream;

// Check if the browser supports getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia is supported!');

    // Request access to video and audio
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        console.log('Stream received:', stream);
        myVideoStream = stream;

        // Add own video stream
        addVideoStream(myVideo, stream);

        // Handle incoming calls
        peer.on('call', call => {
            // Answer the call with your stream
            call.answer(stream);

            // Create a video element for the other user's stream
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream); // Add the other user's video stream to the grid
            });
        });
    }).catch(error => {
        console.error('Error accessing media devices:', error); // Log any errors
    });
} else {
    console.log('getUserMedia is not supported in this browser.');
}

let msg = $('input'); // 'msg' should match the variable used below

$('html').keydown((e) => {
    if (e.which == 13 && msg.val().length !== 0) { // Use 'msg.val()' instead of 'text.val()'
        console.log(msg.val()); // This will log the message to the console
        socket.emit('message', msg.val()); // Emit the message through the socket
        msg.val(''); // Clear the input after sending the message
    }
});

socket.on('createMessage', (message) => {
    $('.messages').append(`<li class="message"><b>user</b><br>${message}</li>`); // Fixed missing closing quote in class attribute
});

// Emit the 'join-room' event with the ROOM_ID and peer.id
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id); 
});

// Handle when a new user connects
socket.on('user-connected', (userId) => {
    console.log(`User connected: ${userId}`);
    connectToNewUser(userId, myVideoStream);
});

// Function to connect to a new user
const connectToNewUser = (userId, stream) => {
    console.log(`Connecting to new user: ${userId}`);
    // Call the new user with your own stream
    const call = peer.call(userId, stream);

    // Create a new video element for the other user's stream
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream); // Add the other user's video stream to the grid
    });
};

// Function to add the video stream to the grid
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
        console.log('Video is playing');
    });
    videoGrid.append(video);
    console.log('Video appended to video grid');
};

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

// Mute or unmute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Play or stop video
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(`Video track enabled: ${enabled}`); // Log the current state

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false; // Stop video
        setPlayVideo(); // Update button
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true; // Play video
        setStopVideo(); // Update button
    }
}

// Set button to stop video
const setStopVideo = () => {
    const html = `
        <i class="fas fa-video-slash"></i>
        <span>Stop Video</span>
    `;
    document.querySelector('.main_video_button').innerHTML = html;
}

// Set button to play video
const setPlayVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Play Video</span>
    `;
    document.querySelector('.main_video_button').innerHTML = html;
}

