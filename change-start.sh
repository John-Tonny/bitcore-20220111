#!/bin/bash

modules="bitcore-node insight"

my_bitcore_path='\/mnt\/ethereum\/ccc\/bitcore'
my_node_path='\/home\/john'

for module in $modules
do
  cd packages/$module
  curpath=$(pwd)
  cd ../../

  sed -i 's/my_bitcore_path/'${my_bitcore_path}'/g' ${curpath}/start.sh
  sed -i 's/my_node_path/'${my_node_path}'/g' ${curpath}/start.sh
  sed -i 's/my_bitcore_path/'${my_bitcore_path}'/g' ${curpath}/stop.sh
done

cd packages/bitcore-wallet-service

module1s="start_masternodeservice.sh stop.sh start_bcmonitor.sh start_messagebroker.sh start_bws.sh start_pushnotificationsservice.sh start_emailservice.sh start.sh start_fiatrateservice.sh stop_bws.sh "

for module1 in $module1s
do
  curpath=$(pwd)
  echo ${module1}
  sed -i 's/my_bitcore_path/'${my_bitcore_path}'/g' ${curpath}/${module1}
  sed -i 's/my_node_path/'${my_node_path}'/g' ${curpath}/${module1}
done


