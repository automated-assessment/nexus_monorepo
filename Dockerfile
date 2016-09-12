FROM node:4

ENV PORT=3000
EXPOSE $PORT

ENV HOME /home/app
ENV APP_DIR $HOME/src

WORKDIR $APP_DIR

COPY . $APP_DIR/

RUN npm install --production --silent

RUN cd configPage && npm install --production --silent

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD [ "start-cfg" ]
