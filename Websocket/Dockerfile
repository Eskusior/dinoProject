FROM python:3

# Add Script
ADD wsServer.py /

# Install app dependencies
RUN pip install pathlib websockets

EXPOSE  6789
CMD ["python", "./wsServer.py"]

