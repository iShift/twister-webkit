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


printbold "Create data directory"

mkdir data
twisterd -daemon -datadir=./data/ -rpcuser=user -rpcpassword=pwd -rpcallowip=127.0.0.1 -dhtproxy
sleep 15
twisterd -datadir=./data/ -rpcuser=user -rpcpassword=pwd addnode seed3.twister.net.co onetry
sleep 5
twisterd -datadir=./data/ -rpcuser=user -rpcpassword=pwd addnode seed2.twister.net.co onetry
sleep 5
twisterd -datadir=./data/ -rpcuser=user -rpcpassword=pwd addnode seed.twister.net.co onetry
sleep 5
twisterd -datadir=./data/ -rpcuser=user -rpcpassword=pwd addnode dnsseed.gombadi.com onetry
sleep 5

BLOCKS="-1"
while : ; do
  sleep 10
  PREV_BLOCKS=$BLOCKS
  BLOCKS=$(twisterd getinfo | grep blocks)
  echo $BLOCKS
  [[ -z $BLOCKS || $BLOCKS != $PREV_BLOCKS ]] || break
done

twisterd -datadir=./data/ -rpcuser=user -rpcpassword=pwd stop


printbold "Done"
