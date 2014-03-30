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


which -s brew
if [[ $? != 0 ]] ; then
# Install Homebrew
# https://github.com/mxcl/homebrew/wiki/installation
printbold "Instaling brew..."
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"   
else
printbold "Updating brew..."
brew update
fi


printbold "Installing dependencies..."

which -s git || brew install git
which -s boost || brew install boost
which -s miniupnpc || brew install miniupnpc
which -s openssl || brew install openssl
which -s berkeley-db4 || brew install berkeley-db4
which -s autoconf || brew install autoconf
which -s automake || brew install automake
which -s libtool || brew install libtool


printbold "Cloning twister-core repository..."

git clone https://github.com/miguelfreitas/twister-core.git
cd twister-core


printbold "Configuring twister-daemon..."

./autotool.sh
./configure --enable-logging --with-openssl=/usr/local/opt/openssl --with-libdb=/usr/local/opt/berkeley-db4


printbold "Building twister daemon..."

CPUCORES=$(sysctl hw.ncpu | awk '{print $2}')
echo "You have $CPUCORES cores in your CPU"
make -j $CPUCORES


printbold "Copying twisterd to /usr/bin..."

sudo cp -i twisterd /usr/bin


printbold "OK, twisterd has been built successfully."
