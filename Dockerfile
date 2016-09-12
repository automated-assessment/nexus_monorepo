FROM node:4

ENV PORT=3002
EXPOSE $PORT

ENV HOME /home/app
ENV APP_DIR $HOME/src

WORKDIR $APP_DIR

COPY * $APP_DIR/

RUN npm install

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD [ "start-rng" ]
