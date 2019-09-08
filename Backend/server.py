#!/usr/bin/env python
# coding: utf-8

# API für DinoProject
# 
# Methoden:
# 
# POST /game: Erstellt eine neue Session und gibt einen Redirect zurück
# 
# GET /highscore/{id} : Liefert zu einer Session-ID den Highscore zurück <br/>
# POST /highscore/{id} : Aktualisiert bei einer Session den Highscore oder legt ihn neu an
# 
# PUT /log/{id} : Erstellt aus übertragenen Zeiten eine Logdatei und speichert diese in DB

# In[1]:


from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from json import dumps
from flask import jsonify, redirect
import optparse
import mysql.connector
import uuid
import os

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}}) # CORS
api = Api(app)


# Datenbank konfigurieren und Verbindung herstellen
mydb = mysql.connector.connect(
    host = "webengineering.ins.hs-anhalt.de",
    port = 32192,
    user = "root",
    passwd = "ga4wm19",
    database = "dinoProject"
)

mycursor = mydb.cursor()
mydb.disconnect() # Vorläufig Verbindung schließen


# In[2]:


# Klasse um eine neue Session zu erstellen
class createSession(Resource):
    def post(self):
        sessionID = str(uuid.uuid4().hex)
        return redirect('http://webengineering.ins.hs-anhalt.de:32195/game/' + sessionID, code=303)

# Klasse für Updaten und Abfragen eines spezifischen Highscores
class getOrAddHighscore(Resource):
    def get(self, id):
        sql = "SELECT * FROM dinoProject.highscoreTable WHERE sessionID = '" + id + "'"
        mydb.reconnect(attempts = 1 , delay = 0)
        mycursor.execute(sql)
        dbResult = mycursor.fetchall()
        
        if len(dbResult) == 1 :
            session = dbResult[0]
            return jsonify({'sessionID': session[0], 'highscore': session[1]})
        else:
            return jsonify({'status': 'none or more than one highscore found', 'statuscode': 409})
        
    def post(self, id):
        if not request.json or not "highscore" in request.json or not "sessionID" in request.json:
            return jsonify({'status': 'could not update highscore', 'statuscode': 409})
        else:
            sql = "INSERT INTO dinoProject.highscoreTable (sessionID, highscore) VALUES (%s, %s) ON DUPLICATE KEY UPDATE highscore = %s"
            values = (id, request.json["highscore"], request.json["highscore"])
            mydb.reconnect(attempts = 1 , delay = 0)
            mycursor.execute(sql, values)
            mydb.commit()
            mydb.disconnect()
            return jsonify({'status': 'updated highscore with id: ' + request.json["sessionID"], 'statuscode': 200})
        
class logTimestampsInDB(Resource):
    def put(self, id):
        if not request.json or not "timeData" in request.json or not "sessionID" in request.json:
            print("Error on Logging Timedata for Session: " + id)
        else:
            # Zeitdaten in File schreiben
            filename = id + '.txt'
            file = open(filename, "w+")
            
            timeData = request.json["timeData"]
            
            for time in timeData:
                file.write("Offset: %d ms\r\n" % time)
            
            # Durchschnitt bilden und hinzufügen
            average = sum(timeData) / len(timeData)
            file.write("Durchschnitt: %d ms\r\n" % average)
            
            file.close()
            
            # Blob erstellen
            binaryData = convertToBlob(filename)
            
            sql = "INSERT INTO dinoProject.logTable (sessionID, logFile) VALUES (%s, %s) ON DUPLICATE KEY UPDATE logFile = %s"
            values = (id, binaryData, binaryData)
            mydb.reconnect(attempts = 1 , delay = 0)
            mycursor.execute(sql, values)
            mydb.commit()
            mydb.disconnect()
            os.remove(filename)
            
def convertToBlob(filename):
    with open(filename, 'rb') as file:
                binaryData = file.read()
    return binaryData


# In[ ]:


# Klassen an entsprechende URLs binden
api.add_resource(createSession, '/game')
api.add_resource(getOrAddHighscore, '/highscore/<id>')
api.add_resource(logTimestampsInDB, '/log/<id>')

# Run für Testzwecke, startet auf localhost:4000
#if __name__ == "__main__":
 #   app.run(port=4000)

# Run für Dockercontainer, mit Portangabe
if __name__ == "__main__":
    parser = optparse.OptionParser(usage="python server.py -p ")
    parser.add_option('-p', '--port', action='store', dest='port', help='The port to listen on.')
    (args, _) = parser.parse_args()
    if args.port == None:
        print("Missing required argument: -p/--port")
        sys.exit(1)
    app.run(host='0.0.0.0', port=int(args.port), debug=False)


