To test the client and the server, a good reference implementation is the chat example from RakNet

Testing procedure:

## Compile the chat example

1. `git clone git@github.com:facebookarchive/RakNet.git && cd RakNet`
2. `cmake . && make` in the main directory
3. `cd Source`
4. `g++ -m64 -g -pthread -I./ "../Samples/Chat Example/Chat Example Server.cpp" *.cpp -o server`
5. `g++ -m64 -g -pthread -I./ "../Samples/Chat Example/Chat Example Client.cpp" *.cpp -o client`

## Run it

Simply run `./server` and `node client.js`, give the right host and port
Same idea for `./client` and `node server.js`
