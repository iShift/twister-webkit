#!/bin/bash -x
echo "Twister - p2p microbloging system - daemon installer"

echo "Installing dependencies"
sudo apt-get install autoconf build-essential git libboost-all-dev libdb++-dev libminiupnpc-dev libssl-dev libtool

echo "Cloning twister-core repository"
git clone https://github.com/miguelfreitas/twister-core.git
cd twister-core

echo "Configuring twister-daemon"
./autotool.sh
./configure --enable-logging

echo "Building twister daemon"
make

echo "Copying twisterd to /usr/local/bin"
sudo cp -i twisterd /usr/local/bin

echo "OK, twisterd has been built successfully"
echo "-------------"
