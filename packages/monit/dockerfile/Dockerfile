FROM ubuntu:18.04
USER root
RUN mkdir -p /root/.nvm/versions/node/v11.15.0
#RUN mkdir -p /root/bitcore
WORKDIR /root
COPY v11.15.0 .nvm/versions/node/v11.15.0
#COPY bitcore ./bitcore
ADD bitcore.tar /root/
RUN ln -s /root/.nvm/versions/node/v11.15.0/bin/node /usr/local/bin/node
RUN ln -s /root/.nvm/versions/node/v11.15.0/bin/npm /usr/local/bin/npm
WORKDIR /root/bitcore
RUN apt update
RUN apt install monit -y
COPY monit/conf/*.conf /etc/monit/conf.d/
COPY monit/monitrc /etc/monit/
#RUN apt install cron -y
#COPY cron/cron /etc/pam.d/
#COPY cron/root /var/spool/cron/crontabs/
EXPOSE 3232
EXPOSE 8200
EXPOSE 3380
EXPOSE 3300
ENV chain=VCL
ENV network=mainnet
ENV RPC_USERNAME=chain
ENV RPC_PASSWORD=999000
ENV RPC_PORT=9902
ENV P2P_PORT=9900
CMD echo $DB_URL
## ENTRYPOINT monit -I

