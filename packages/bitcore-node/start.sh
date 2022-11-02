#!/bin/bash

if [ "x${NODE_SPACE_SIZE}" == "x" ]; then
  NODE_SPACE_SIZE=3072
fi

BITCORE_PATH=/mnt/ethereum/ccc/bitcore
NODE_PATH=/home/john/.nvm/versions/node/v11.15.0/bin

MODULE_PATH=${BITCORE_PATH}/packages
LOG_PATH=${BITCORE_PATH}/logs

if [ ! -d ${LOG_PATH}  ]; then
  mkdir ${LOG_PATH}
fi

cd ${MODULE_PATH}/bitcore-node

# run_program (pidfile, logfile)
run_program ()
{
  pidfile=$1
  logfile=$2

  if [ -e "$pidfile" ]
  then
    echo "$nodefile is already running. Run 'npm stop' if you wish to restart."
    return 0
  fi

  nohup $NODE_PATH/node --max_old_space_size=${NODE_SPACE_SIZE}  $MODULE_PATH/bitcore-node/build/src/server.js  >> $logfile 2>&1 &
  PID=$!
  if [ $? -eq 0 ]
  then
    echo "Successfully started $nodefile. PID=$PID. Logs are at $logfile"
    echo $PID > $pidfile
    return 0
  else
    echo "Could not start $nodefile - check logs at $logfile"
    exit 1
  fi
}

./stop.sh

run_program bitcore-node.pid $LOG_PATH/bitcore-node.log

