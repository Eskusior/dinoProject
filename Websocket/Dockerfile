FROM alpine:3.1

# Update
RUN apk add --update python py-pip

# Install app dependencies
RUN pip install asyncio json logging websockets time

# Bundle app source
COPY wsServer.py /src/wsServer.py

EXPOSE  5002
CMD ["python", "/src/wsServer.py", "-p 6789"]

