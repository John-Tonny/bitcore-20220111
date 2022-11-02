#!/bin/bash

if [ $# -eq 0 ]; then
  echo "无效参数"
  exit -1
fi

BITCORE_PATH=/mnt/ethereum/ccc/bitcore

MODULE_PATH=$BITCORE_PATH/packages

cd $MODULE_PATH/bitcore-wallet-service

waitExit() {
    pid=$1
    if [ "$pid" == "" ]; then
        echo "pid is empty!"
        return 1
    fi

    for((i=0;i<30;i++));
    do
        echo -n "."
        p=`ps -ef | grep "$pid" | grep -v grep | awk -F' ' '{print $2}'`
	echo $p
        if [ "$p" == "" ]; then
            echo "exit finish!"
            return 0
        fi
        sleep 1s
    done

    echo "exit timeout!"
    return 1
}

kill_zombie()
{
  ps -A -o stat,ppid,pid,cmd | grep -e '^[Zz]' | awk '{print $2}' | xargs kill -HUP
}

stop_program ()
{
  pidfile=$1

  if [ -f $pidfile ]; then
    echo "Stopping Process - $pidfile. PID=$(cat $pidfile)"
    kill -9 $(cat $pidfile)

    waitExit $(cat $pidfile)
    if [ "$?" != "0" ]; then
      echo "proc stop timeout,exit.pid:$pid"
      exit 1
    fi

    rm -rf $pidfile
    kill_zombie

  else
    echo "Stopping Process - $pidfile."
  fi
  
}

stop_program $1

