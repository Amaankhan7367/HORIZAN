import {apiUrl} from "../conf/conf"


class WebSocketService {
    constructor() {
        this.socket = null;
        this.onMessageCallback = null;
    }


    // Connect WebSocket
    connect(userId, onMessage) {

        if (this.socket) {
            this.socket.close();
        }

        this.onMessageCallback = onMessage;

        this.socket = new WebSocket(
            //`ws://127.0.0.1:8000/ws/${userId}`
            `${apiUrl.replace("http://", "ws://")}/ws/${userId}`
        );


        this.socket.onopen = () => {
            console.log("WebSocket Connected");
        };


        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("Message received:", data);

            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
        };


        this.socket.onclose = () => {
            console.log("WebSocket Disconnected");
        };


        this.socket.onerror = (error) => {
            console.log("WebSocket Error:", error);
        };
    }


    // Send message
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


        this.socket.send(
            JSON.stringify({
                conversation_id: conversationId,
                receiver_id: receiverId,
                ciphertext: ciphertext,
                messageType: messageType
            })
        );
    }


    // Disconnect
    disconnect() {

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}


const websocketService = new WebSocketService();

export default websocketService;