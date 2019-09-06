FROM alpine:3.1

# Update
RUN apk add --update python py-pip

# Install app dependencies
RUN pip install flask flask-jsonpify flask-sqlalchemy flask-restful flask-cors mysql-connector-python

# Bundle app source
COPY server.py /src/server.py

EXPOSE  5002
CMD ["python", "/src/server.py", "-p 5002"]
