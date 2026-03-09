package edu.eci.arsw.canvas;

import java.util.UUID;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import edu.eci.arsw.canvas.models.DrawEvent;

public class CanvasBroadcastServer {

    public static void main(String[] args) {

        Configuration config = new Configuration();
        config.setHostname("0.0.0.0");
        config.setPort(9092);

        // Para navegador (polling) suele requerir CORS, sobre todo en dev. [2](https://github.com/socketio4j/netty-socketio)
        config.setOrigin("*");

        // Si tu versión lo soporta, también puedes habilitar CORS explícito (release lo menciona). [3](https://www.youtube.com/watch?v=VSR0S8aHAkc)
        // config.setEnableCors(true);

        final SocketIOServer server = new SocketIOServer(config);

        server.addConnectListener(new ConnectListener() {
            public void onConnect(SocketIOClient client) {
                System.out.println("Connected Client: " + client.getSessionId());
            }
        });

        server.addDisconnectListener(new DisconnectListener() {
            public void onDisconnect(SocketIOClient client) {
                System.out.println("Disconnected Client: " + client.getSessionId());
            }
        });

        server.addEventListener("drawEvent", DrawEvent.class, new DataListener<DrawEvent>() {
            public void onData(SocketIOClient sender, DrawEvent data, AckRequest ackRequest) {
                System.out.println("Dibujando");
                UUID senderId = sender.getSessionId();
                for (SocketIOClient client : server.getAllClients()) {
                    if (!client.getSessionId().equals(senderId)) {
                        client.sendEvent("drawBroadcast", data);
                    }
                }
            }
        });

        server.start();
        System.out.println("Socket.IO Java Server running at http://localhost:9092");

        try {
            Thread.sleep(60 * 60 * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        server.stop();
    }
}