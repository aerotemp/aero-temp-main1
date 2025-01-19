from websocket_server import WebsocketServer
import serial
import threading
# Replace with your Arduino's port and baud rate
SERIAL_PORT = "/dev/tty.usbmodem141101"  # Update this with your Arduino port
BAUD_RATE = 9600

# Create a WebSocket server
server = WebsocketServer(host="127.0.0.1", port=5001)

def read_from_arduino():
    """Read data from Arduino and send it to WebSocket clients."""
    with serial.Serial(SERIAL_PORT, BAUD_RATE) as ser:
        while True:
            if ser.in_waiting > 0:
                raw_data = ser.readline().decode("utf-8").strip()
                print(f"Sending: {raw_data}")  # Debugging log
                server.send_message_to_all(raw_data)

def on_new_client(client, server):
    """Callback when a new client connects."""
    print(f"New client connected: {client}")

def on_client_left(client, server):
    """Callback when a client disconnects."""
    print(f"Client disconnected: {client}")

def on_message_received(client, server, message):
    """Callback when a message is received from a client."""
    print(f"Message from client {client}: {message}")

# Set up WebSocket server callbacks
server.set_fn_new_client(on_new_client)
server.set_fn_client_left(on_client_left)
server.set_fn_message_received(on_message_received)


# Run the WebSocket server in a separate thread
threading.Thread(target=server.run_forever, daemon=True).start()

print("Server started on ws://127.0.0.1:5001/")
# Start reading from Arduino
read_from_arduino()
