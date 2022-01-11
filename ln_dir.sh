#!/bin/sh

rm -rf packages/bitcore-client/node_modules/bitcore-mnemonic
rm -rf packages/bitcore-client/node_modules/crypto-wallet-core
rm -rf packages/bitcore-client/node_modules/bitcore-lib-vcl
cd packages/bitcore-client/node_modules
ln -s ../../bitcore-mnemonic ./bitcore-mnemonic
ln -s ../../crypto-wallet-core ./crypto-wallet-core
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

#rm -rf ../../bitcore-lib/node_modules/bitcore-build
#cd ../../bitcore-lib/node_modules
#ln -s ../../bitcore-build ./bitcore-build

#rm -rf ../../bitcore-lib-cash/node_modules/bitcore-build
rm -rf ../../bitcore-lib-cash/node_modules/bitcore-lib
cd ../../bitcore-lib-cash/node_modules
#ln -s ../../bitcore-build ./bitcore-build
ln -s ../../bitcore-lib ./bitcore-lib

#rm -rf ../../bitcore-lib-ltc/node_modules/bitcore-build
#cd ../../bitcore-lib-ltc/node_modules
#ln -s ../../bitcore-build ./bitcore-build

#rm -rf ../../bitcore-mnemonic/node_modules/bitcore-build
rm -rf ../../bitcore-mnemonic/node_modules/bitcore-lib-vcl
cd ../../bitcore-mnemonic/node_modules
#ln -s ../../bitcore-build ./bitcore-build
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

rm -rf ../../bitcore-node/node_modules/bitcore-client
rm -rf ../../bitcore-node/node_modules/bitcore-p2p
rm -rf ../../bitcore-node/node_modules/bitcore-wallet-client
rm -rf ../../bitcore-node/node_modules/crypto-wallet-core
rm -rf ../../bitcore-node/node_modules/bitcore-lib-vcl
cd ../../bitcore-node/node_modules
ln -s ../../bitcore-client ./bitcore-client
ln -s ../../bitcore-p2p ./bitcore-p2p
ln -s ../../bitcore-wallet-client ./bitcore-wallet-client
ln -s ../../crypto-wallet-core ./crypto-wallet-core
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

#rm -rf ../../bitcore-p2p/node_modules/bitcore-build
rm -rf ../../bitcore-p2p/node_modules/bitcore-lib-vcl
cd ../../bitcore-p2p/node_modules
#ln -s ../../bitcore-build ./bitcore-build
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

#rm -rf ../../bitcore-p2p-cash/node_modules/bitcore-build
rm -rf ../../bitcore-p2p-cash/node_modules/bitcore-lib
rm -rf ../../bitcore-p2p-cash/node_modules/bitcore-lib-cash
cd ../../bitcore-p2p-cash/node_modules
#ln -s ../../bitcore-build ./bitcore-build
ln -s ../../bitcore-lib ./bitcore-lib
ln -s ../../bitcore-lib-cacsh ./bitcore-lib-cash

rm -rf ../../bitcore-wallet/node_modules/bitcore-wallet-client
rm -rf ../../bitcore-wallet/node_modules/bitcore-lib-vcl
cd ../../bitcore-wallet/node_modules
ln -s ../../bitcore-wallet-client ./bitcore-wallet-client
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

rm -rf ../../bitcore-wallet-client/node_modules/bitcore-mnemonic
rm -rf ../../bitcore-wallet-client/node_modules/bitcore-wallet-service
rm -rf ../../bitcore-wallet-client/node_modules/crypto-wallet-core
cd ../../bitcore-wallet-client/node_modules
ln -s ../../bitcore-mnemonic ./bitcore-mnemonic
ln -s ../../bitcore-wallet-service ./bitcore-wallet-service
ln -s ../../crypto-wallet-core ./crypto-wallet-core

rm -rf ../../bitcore-wallet-service/node_modules/crypto-wallet-core
rm -rf ../../bitcore-wallet-service/node_modules/bitcore-lib-vcl
cd ../../bitcore-wallet-service/node_modules
ln -s ../../crypto-wallet-core ./crypto-wallet-core
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl

rm -rf ../../crypto-wallet-core/node_modules/bitcore-lib-vcl
cd ../../crypto-wallet-core/node_modules
ln -s ../../bitcore-lib-vcl ./bitcore-lib-vcl


