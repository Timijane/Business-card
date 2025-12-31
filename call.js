// Firebase config (YOUR CONFIG)
const firebaseConfig = {
  apiKey: "AIzaSyDtqM_pMGIYkUgy0OWGsQbfS9MtYQhrgZM",
  authDomain: "meet-6e159.firebaseapp.com",
  projectId: "meet-6e159",
  storageBucket: "meet-6e159.firebasestorage.app",
  messagingSenderId: "252353608421",
  appId: "1:252353608421:web:6706056048e9a8f12db20c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// URL params
const params = new URLSearchParams(location.search);
const roomId = params.get("room");
const callType = params.get("type") || "video";

// UI
const ringing = document.getElementById("ringing");
const callUI = document.getElementById("callUI");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let ringtoneAudio;
let pc;
let localStream;

// WebRTC config
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

// Firestore refs
const callDoc = db.collection("calls").doc(roomId);
const offerCandidates = callDoc.collection("offerCandidates");
const answerCandidates = callDoc.collection("answerCandidates");
const messagesRef = callDoc.collection("messages");

// Play ringtone
function playRingtone() {
  const tone = document.getElementById("ringtone").value;
  ringtoneAudio = new Audio(tone);
  ringtoneAudio.loop = true;
  ringtoneAudio.play();
}

function stopRingtone() {
  ringtoneAudio && ringtoneAudio.pause();
}

// Start ringing
playRingtone();

// Accept call
async function acceptCall() {
  stopRingtone();
  ringing.classList.add("hidden");
  callUI.classList.remove("hidden");
  await startWebRTC(false);
}

// Reject call
function rejectCall() {
  stopRingtone();
  window.location.href = "chat.html";
}

// Start WebRTC
async function startWebRTC(isCaller) {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: callType === "video"
  });

  localVideo.srcObject = localStream;

  pc = new RTCPeerConnection(rtcConfig);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = e => {
    remoteVideo.srcObject = e.streams[0];
  };

  pc.onicecandidate = e => {
    if (e.candidate) {
      const ref = isCaller ? offerCandidates : answerCandidates;
      ref.add(e.candidate.toJSON());
    }
  };

  if (isCaller) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await callDoc.set({ offer });
  }

  callDoc.onSnapshot(async snap => {
    const data = snap.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  });

  answerCandidates.onSnapshot(snap => {
    snap.docChanges().forEach(change => {
      if (change.type === "added") {
        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}

// Toggle mic
function toggleMic() {
  const track = localStream.getAudioTracks()[0];
  track.enabled = !track.enabled;
}

// Toggle camera
function toggleCam() {
  const track = localStream.getVideoTracks()[0];
  if (track) track.enabled = !track.enabled;
}

// End call
function endCall() {
  pc && pc.close();
  localStream && localStream.getTracks().forEach(t => t.stop());
  window.location.href = "chat.html";
}

// Chat
messagesRef.onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      const msg = change.doc.data().text;
      document.getElementById("messages").innerHTML += `<div>${msg}</div>`;
    }
  });
});

function sendMessage(e) {
  if (e.key === "Enter" && e.target.value.trim()) {
    messagesRef.add({ text: e.target.value });
    e.target.value = "";
  }
}

// Caller automatically starts
startWebRTC(true);
