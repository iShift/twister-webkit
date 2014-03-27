#!/bin/bash
echo "Twister - p2p microbloging system - daemon installer"

which -s brew
if [[ $? != 0 ]] ; then
# Install Homebrew
# https://github.com/mxcl/homebrew/wiki/installation
echo "Instaling brew"
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"   
else
echo "Updating brew"
brew update
fi

echo "Installing dependencies"
which -s git || brew install git
which -s boost || brew install boost
which -s miniupnpc || brew install miniupnpc
which -s openssl || brew install openssl
which -s berkeley-db4 || brew install berkeley-db4
which -s autoconf || brew install autoconf
which -s automake || brew install automake
which -s libtool || brew install libtool

echo "Cloning twister-core repository"
git clone https://github.com/miguelfreitas/twister-core.git
cd twister-core

echo "Configuring twister-daemon"
./autotool.sh
./configure --enable-logging --with-openssl=/usr/local/opt/openssl --with-libdb=/usr/local/opt/berkeley-db4

echo "Building twister daemon"
CPUCORES=$(sysctl hw.ncpu | awk '{print $2}')
echo "You have $CPUCORES cores in your CPU"
make -j $CPUCORES

echo "Copying twisterd to /usr/local/bin"
sudo cp -i twisterd /usr/local/bin

echo "OK, twisterd has been built successfully"
echo "-------------"
