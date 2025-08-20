import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import {
  CallEnd,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Chat,
} from "@mui/icons-material";
import { io } from "socket.io-client";
import "./videoMeet.css";

const server_url = import.meta.env.VITE_APP_BASE_URL;

var connection = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeet() {
  // Get meeting ID from route
  const { id } = useParams();

  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const remoteVideoRefs = useRef({});

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [showModal, setShowModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(3);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  // Helper functions
  const createPeerConnection = (socketId) => {
    const pc = new RTCPeerConnection(peerConfigConnections);
    connection[socketId] = pc;

    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, window.localStream);
      });
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        setVideos((prev) => {
          if (prev.find((v) => v.socketId === socketId)) {
            return prev.map((v) =>
              v.socketId === socketId ? { ...v, stream } : v
            );
          }
          return [...prev, { socketId, stream }];
        });
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit(
          "signal",
          socketId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    return pc;
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioAvailable(!!audioPermission);

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    for (let id in connection) {
      if (id === socketIdRef.current) continue;
      const senders = connection[id].getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          connection[id].removeTrack(sender);
        }
      });

      stream.getTracks().forEach((track) => {
        connection[id].addTrack(track, stream);
      });

      connection[id]
        .createOffer()
        .then((description) => {
          connection[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connection[id].localDescription })
              );
            })
            .catch(console.log);
        })
        .catch(console.log);
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          if (localVideoRef.current)
            localVideoRef.current.srcObject = window.localStream;

          for (let id in connection) {
            connection[id].addStream(window.localStream);

            connection[id]
              .createOffer()
              .then((description) => {
                connection[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: connection[id].localDescription })
                    );
                  })
                  .catch(console.log);
              })
              .catch(console.log);
          }
        })
    );
  };

  let silence = () => {
    let ctx = new window.AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      let constraints = {
        video: video && videoAvailable,
        audio: audio && audioAvailable,
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (!video && audio) {
            const blackTrack = black();
            stream.addTrack(blackTrack);
          }
          if (!audio && video) {
            const silentTrack = silence();
            stream.addTrack(silentTrack);
          }
          getUserMediaSuccess(stream);
        })
        .catch(console.log);
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch {}

      let blackSilence = (...args) =>
        new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      if (localVideoRef.current)
        localVideoRef.current.srcObject = window.localStream;

      for (let id in connection) {
        if (id === socketIdRef.current) continue;
        const senders = connection[id].getSenders();
        senders.forEach((sender) => {
          if (sender.track) {
            connection[id].removeTrack(sender);
          }
        });
        window.localStream.getTracks().forEach((track) => {
          connection[id].addTrack(track, window.localStream);
        });

        connection[id]
          .createOffer()
          .then((description) => {
            connection[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connection[id].localDescription })
                );
              })
              .catch(console.log);
          })
          .catch(console.log);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (!connection[fromId]) {
        createPeerConnection(fromId);
      }

      if (signal.sdp) {
        connection[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connection[fromId]
                .createAnswer()
                .then((description) => {
                  connection[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connection[fromId].localDescription,
                        })
                      );
                    })
                    .catch(console.log);
                })
                .catch(console.log);
            }
          })
          .catch(console.log);
      }

      if (signal.ice) {
        connection[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch(console.log);
      }
    }
  };

  let addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  let connectToSocketServer = () => {
    socketRef.current = io(server_url, {
      transports: ["websocket"],
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      // Pass meeting id as room
      socketRef.current.emit("join-call", id);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((video) => video.socketId !== id));

        if (connection[id]) {
          connection[id].close();
          delete connection[id];
        }

        if (remoteVideoRefs.current[id]) {
          remoteVideoRefs.current[id].srcObject = null;
          delete remoteVideoRefs.current[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;

          if (!connection[socketListId]) {
            createPeerConnection(socketListId);
          }
        });

        if (id === socketIdRef.current) {
          clients.forEach((socketListId) => {
            if (socketListId === socketIdRef.current) return;

            connection[socketListId]
              .createOffer()
              .then((desc) =>
                connection[socketListId].setLocalDescription(desc)
              )
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({
                    sdp: connection[socketListId].localDescription,
                  })
                );
              })
              .catch(console.log);
          });
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const toggleVideo = () => {
    if (video) {
      setVideo(false);
    } else {
      setVideo(videoAvailable);
    }
  };

  const toggleAudio = () => {
    if (audio) {
      setAudio(false);
    } else {
      setAudio(audioAvailable);
    }
  };

  const handleScreen = () => {
    if (!screen) {
      getDisplayMedia();
    } else {
      getPermissions();
      setScreen(false);
    }
  };

  let getDisplayMediaSuccess = (stream) => {
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setScreen(true);

    for (let id in connection) {
      if (id === socketIdRef.current) continue;

      const senders = connection[id].getSenders();

      stream.getTracks().forEach((newTrack) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === newTrack.kind
        );
        if (sender) {
          sender.replaceTrack(newTrack).catch((e) => {
            connection[id].removeTrack(sender);
            connection[id].addTrack(newTrack, stream);
          });
        } else {
          connection[id].addTrack(newTrack, stream);
        }
      });

      connection[id]
        .createOffer()
        .then((description) => {
          return connection[id].setLocalDescription(description);
        })
        .then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connection[id].localDescription })
          );
        })
        .catch(console.log);
    }

    stream.getVideoTracks()[0].onended = async () => {
      await getPermissions();

      for (let id in connection) {
        if (id === socketIdRef.current) continue;

        const senders = connection[id].getSenders();
        const newStream = window.localStream;

        newStream.getTracks().forEach((newTrack) => {
          const sender = senders.find(
            (s) => s.track && s.track.kind === newTrack.kind
          );
          if (sender) {
            sender.replaceTrack(newTrack).catch((e) => {
              connection[id].removeTrack(sender);
              connection[id].addTrack(newTrack, newStream);
            });
          } else {
            connection[id].addTrack(newTrack, newStream);
          }
        });

        const offer = await connection[id].createOffer();
        await connection[id].setLocalDescription(offer);

        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({ sdp: connection[id].localDescription })
        );
      }

      setScreen(false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    };
  };

  let getDisplayMedia = () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: audioAvailable })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  });

  let routeTo = useNavigate();

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } catch(e) {}
    routeTo("/home");
  };

  let sendMessages = () => {
    if (message.trim() !== "") {
      const newMsg = {
        text: message,
        from: socketIdRef.current,
        username,
      };
      socketRef.current.emit("chat-message", newMsg);
      setMessage("");
    }
  };

  useEffect(() => {
    videos.forEach((video) => {
      if (
        remoteVideoRefs.current[video.socketId] &&
        video.stream &&
        remoteVideoRefs.current[video.socketId].srcObject !== video.stream
      ) {
        remoteVideoRefs.current[video.socketId].srcObject = video.stream;
      }
    });
  }, [videos]);

  return (
    <div className="meetRoot">
      <div className="meetingHeader">
        <h2 className="meetingId">Meeting ID: {id || "No meeting ID"}</h2>
      </div>

      {askForUsername === true ? (
        <div className="lobby">
          <div className="lobbyCard">
            <h2 className="lobbyTitle">Enter into Lobby</h2>

            {/* centered preview */}
            <div className="previewWrapper">
              <video
                className="previewVideo"
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
              ></video>
            </div>

            {/* name + connect below video */}
            <div className="nameConnect">
              <TextField
                id="outlined-basic"
                label="username"
                className="usernameInput"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                className="connectBtn"
                onClick={connect}
              >
                Connect
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="meetVideoContainer">
          {showModal ? (
            <div className="chatRoom">
              <div className="chatContainer">
                <h1 className="chatHeader">Chat</h1>
                <div className="chatMessages">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chatMessage ${
                        msg.from === socketIdRef.current ? "self" : "other"
                      }`}
                    >
                      <strong>{msg.username || "User"}: </strong>
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>
                <div className="chatInput">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="small"
                    className="chatTextField"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendMessages}
                    className="chatSendBtn"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="btn-container">
            <IconButton className="ctrlBtn" onClick={toggleVideo}>
              {video === true ? <Videocam /> : <VideocamOff />}
            </IconButton>

            <IconButton className="endBtn" onClick={handleEndCall}>
              <CallEnd />
            </IconButton>

            <IconButton className="ctrlBtn" onClick={toggleAudio}>
              {audio === true ? <Mic /> : <MicOff />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton className="ctrlBtn" onClick={handleScreen}>
                {screen === true ? <ScreenShare /> : <StopScreenShare />}
              </IconButton>
            ) : null}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                className="chatToggleBtn"
                onClick={() => setShowModal(!showModal)}
              >
                <Chat />
              </IconButton>
            </Badge>
          </div>

          {/* local self-view */}
          <video
            className="meetUserVideo"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          ></video>

          {/* remote grid */}
          <div className="conferencingView">
            {videos.map((video) => (
              <div className="remoteTile" key={video.socketId}>
                <video
                  ref={(ref) => {
                    remoteVideoRefs.current[video.socketId] = ref;
                  }}
                  autoPlay
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
