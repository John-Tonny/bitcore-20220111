#!/bin/bash

if [ "x${BITCORE_PATH}" == "x" ]; then
  BITCORE_PATH=/root/bitcore
fi

if [ "x${NODE_PATH1}" == "x" ]; then
  NODE_PATH=$HOME/.nvm/versions/node/v10.5.0/bin
fi

MODULE_PATH=$BITCORE_PATH/packages
LOG_PATH=$BITCORE_PATH/logs

if [ ! -d $LOG_PATH  ]; then
  mkdir $LOG_PATH
fi

cd $MODULE_PATH/bitcore-node

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

  nohup $NODE_PATH/node --max_old_space_size=3072  $MODULE_PATH/bitcore-node/build/src/server.js  >> $logfile 2>&1 &
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

