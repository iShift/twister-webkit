#!/bin/bash

ECHO_C=
ECHO_N=
case `echo -n x` in
-n*)
  case `echo 'x\c'` in
  *c*) ;;
  *)   ECHO_C='\c';;
  esac;;
*)
  ECHO_N='-n';;
esac
boldface="`tput bold 2>/dev/null`"
normal="`tput sgr0 2>/dev/null`"
printbold() {
  echo $ECHO_N "$boldface" $ECHO_C
  echo "$@"
  echo $ECHO_N "$normal" $ECHO_C
}

printbold "Twister - p2p microbloging system - daemon installer"

printbold "Installing dependencies..."

sudo apt-get install autoconf build-essential git libboost-all-dev libdb++-dev libminiupnpc-dev libssl-dev libtool

printbold "Cloning twister-core repository..."

git clone https://github.com/miguelfreitas/twister-core.git
cd twister-core

printbold "Configuring twister-daemon..."

./autotool.sh
./configure --enable-logging

printbold "Building twister daemon..."

make

printbold "Copying twisterd to /usr/local/bin..."

sudo cp -i twisterd /usr/local/bin

printbold "OK, twisterd has been built successfully."
