// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     this.onMessageCallback = null;
//   }

//   // Connect WebSocket
//   connect(userId, onMessage) {
//     // Close existing connection
//     if (this.socket) {
//       this.socket.close();
//     }

//     this.onMessageCallback = onMessage;

//     this.socket = new WebSocket(
//       `ws://127.0.0.1:8000/ws/${userId}`
//     );

//     this.socket.onopen = () => {
//       console.log("WebSocket Connected");
//     };

//     this.socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         console.log("Message received:", data);

//         if (this.onMessageCallback) {
//           this.onMessageCallback(data);
//         }
//       } catch (error) {
//         console.log("WebSocket message parse error:", error);
//       }
//     };

//     this.socket.onclose = (event) => {
//       console.log("WebSocket Disconnected:", event.code);
//     };

//     this.socket.onerror = (error) => {
//       console.log("WebSocket Error:", error);
//     };
//   }

//   // Send message
//   sendMessage({
//     conversationId,
//     receiverId,
//     ciphertext,
//     messageType = "text",
//   }) {
//     if (!this.socket) {
//       console.log("WebSocket not connected");
//       return;
//     }

//     if (this.socket.readyState !== WebSocket.OPEN) {
//       console.log("WebSocket is not open");
//       return;
//     }

//     this.socket.send(
//       JSON.stringify({
//         conversation_id: conversationId,
//         receiver_id: receiverId,
//         ciphertext: ciphertext,
//         messageType: messageType,
//       })
//     );
//   }

//   // Disconnect
//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }

//     this.onMessageCallback = null;
//   }
// }

// const websocketService = new WebSocketService();

// export default websocketService;

import { API_URL } from "../conf/conf";

class WebSocketService {
    constructor() {
        this.socket = null;
        this.onMessageCallback = null;
    }

    // =========================
    // CONNECT WEBSOCKET
    // =========================
    connect(userId, onMessage) {

        if (!userId) {
            console.log("WebSocket Error: userId is missing");
            return;
        }

        // Close existing socket
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.onMessageCallback = onMessage;

        // const wsUrl = `ws://127.0.0.1:8000/ws/${userId}`;
        const wsUrl = `${API_URL.replace("http://", "ws://")}/ws/${userId}`;


        console.log("Connecting WebSocket:", wsUrl);

        this.socket = new WebSocket(wsUrl);

        // =========================
        // OPEN
        // =========================
        this.socket.onopen = () => {
            console.log("WebSocket Connected");
        };

        // =========================
        // MESSAGE
        // =========================
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                console.log("Message received:", data);

                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
            } catch (error) {
                console.log("WebSocket message parse error:", error);
            }
        };

        // =========================
        // CLOSE
        // =========================
        this.socket.onclose = (event) => {
            console.log(
                "WebSocket Disconnected:",
                event.code,
                event.reason
            );
        };

        // =========================
        // ERROR
        // =========================
        this.socket.onerror = (error) => {
            console.log("WebSocket Error:", error);
        };
    }

    // =========================
    // SEND MESSAGE
    // =========================
    sendMessage({
        conversationId,
        receiverId,
        ciphertext,
        messageType = "text"
    }) {

        if (!this.socket) {
            console.log("WebSocket not connected");
            return;
        }

        if (this.socket.readyState !== WebSocket.OPEN) {
            console.log("WebSocket is not open");
            return;
        }

        const message = {
            conversation_id: conversationId,
            receiver_id: receiverId,
            ciphertext: ciphertext,
            messageType: messageType
        };

        console.log("Sending WebSocket message:", message);

        this.socket.send(JSON.stringify(message));
    }

    // =========================
    // DISCONNECT
    // =========================
    disconnect() {

        if (this.socket) {
            console.log("Closing WebSocket");

            this.socket.close();
            this.socket = null;
        }

        this.onMessageCallback = null;
    }

    // =========================
    // CHECK CONNECTION
    // =========================
    isConnected() {
        return (
            this.socket &&
            this.socket.readyState === WebSocket.OPEN
        );
    }
}

const websocketService = new WebSocketService();

export default websocketService;