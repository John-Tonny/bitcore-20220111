#!/bin/bash

modules="bitcore-node.conf bws.conf bws_fiatrateservice.conf bws_messagebroker.conf insight.conf bws_bcmonitor.conf bws_emailservice.conf bws_masternodeservice.conf bws_pushnotificationsservice.conf"

conf_path=/etc/monit/conf.d

for module in $modules
do
  echo "$module"
  sed -i 's/\/home\/john/\/mnt\/ethereum\/ccc/g' ${conf_path}/${module}
done


