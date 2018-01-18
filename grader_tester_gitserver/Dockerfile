FROM cirocosta/gitserver-http

ADD ./entrypoint.sh /usr/local/bin/new-entrypoint

ENTRYPOINT [ "new-entrypoint" ]
CMD [ "-start" ]
