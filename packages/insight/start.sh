#!/bin/bash

if [ "x${BITCORE_PATH}" == "x" ]; then
  BITCORE_PATH=/root/bitcore
fi

if [ "x${NODE_PATH}" == "x" ]; then
  NODE_VERSION=`node -v`
  NODE_PATH=$HOME/.nvm/versions/node/$NODE_VERSION/bin
fi

MODULE_PATH=$BITCORE_PATH/packages
LOG_PATH=$BITCORE_PATH/logs

if [ ! -d $LOG_PATH  ]; then
  mkdir $LOG_PATH
fi

cd $MODULE_PATH/insight

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

  nohup $NODE_PATH/node $MODULE_PATH/insight/node_modules/.bin/ionic-app-scripts serve --port 8200  >> $logfile 2>&1 &
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
run_program insight.pid $LOG_PATH/insight.log

