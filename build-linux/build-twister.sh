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

if [ -f /proc/cpuinfo ]
then
  CPUCORES=$(grep "^processor" /proc/cpuinfo | wc -l)
  echo "You have $CPUCORES cores in your CPU"
  make -j $CPUCORES
else
  make
fi


printbold "Copying twisterd to /usr/local/bin..."

sudo cp -i twisterd /usr/local/bin


printbold "Create shortcut file to run Twister..."

cd ..
CWD=$(pwd)
cat > "Twister.desktop" << EOF
[Desktop Entry]
Version=1.0
Encoding=UTF-8
Type=Application
Name=Twister
Exec=$CWD/twister.sh
Terminal=false
Icon=$CWD/twister_logo.png
EOF
chmod +x Twister.desktop


printbold "OK, twisterd has been built successfully."
