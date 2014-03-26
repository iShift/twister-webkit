#!/bin/bash -x
sudo apt-get install autoconf build-essential git libboost-all-dev libdb++-dev libminiupnpc-dev libssl-dev libtool
git clone https://github.com/miguelfreitas/twister-core.git
cd twister-core
./autotool.sh
./configure
make
make install
