#!/usr/bin/env python
# coding: utf-8

# API für DinoProject
# 
# Methoden:
# 
# GET /session : Liefert alle Session-IDs aus der DB zurück <br/>
# POST /session : Erstellt eine neue Session in der DB
# 
# GET /session/{id} : Liefert zu einer Session-ID den Highscore zurück <br/>
# PUT /session/{id} : Aktualisiert bei einer Session den Highscore

# In[1]:


from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from json import dumps
from flask import jsonify
import optparse
import mysql.connector

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


# In[ ]:


# Klasse für /session
class getSessionsOrAddNew(Resource):
    
    # Alle Sessions holen
    def get(self):
        result = []
        
        # Datenbank reconnect
        mydb.reconnect(attempts = 1, delay = 0)
        # SQL Query
        mycursor.execute("SELECT * FROM dinoProject.sessionTable")
        # Rückgabe holen
        dbResult = mycursor.fetchall()
        
        # Jede Session an result anhängen
        for session in dbResult:
            result.append({'id': session[0], 'highscore': session[1]})
        
        # Verbindung schließen
        mydb.disconnect()
        
        if len(result) > 0:
            return jsonify(result)
        else:
            return jsonify({'status': 'no existing sessions', 'statuscode': 200})
        
    # Neue Session erstellen
    def post(self):
        # Wenn übergebenes Objekt unvollständig
        if not request.json or not "highscore" in request.json:
            return jsonify({'status': 'could not add session', 'statuscode': 409})
        else:
            sql = 'INSERT INTO dinoProject.sessionTable (highscore) VALUES (%s)'
            values = (request.json["highscore"], )
            mydb.reconnect(attempts = 1, delay = 0)
            mycursor.execute(sql, values)
            mydb.commit() # Änderungen an DB commiten
            mydb.disconnect()
            
            return jsonify({'status': 'session added', 'statuscode': 200})

class getOrUpdateSpecificSession(Resource):
    def get(self, id):
        sql = "SELECT * FROM dinoProject.sessionTable WHERE id = '" + id + "'"
        mydb.reconnect(attempts = 1 , delay = 0)
        mycursor.execute(sql)
        dbResult = mycursor.fetchall()
        
        if len(dbResult) == 1 :
            session = dbResult[0]
            return jsonify({'id': session[0], 'highscore': session[1]})
        else:
            return jsonify({'status': 'none or more than one session found', 'statuscode': 409})
        
    def put(self, id):
        if not request.json or not "highscore" in request.json:
            return jsonify({'status': 'could not update session', 'statuscode': 409})
        else:
            sql = "UPDATE dinoProject.sessionTable SET highscore = %s WHERE id = %s"
            values = (request.json["highscore"], id)
            mydb.reconnect(attempts = 1 , delay = 0)
            mycursor.execute(sql, values)
            mydb.commit()
            mydb.disconnect()
            return jsonify({'status': 'updated sessions with id: ' + id, 'statuscode': 200})


# In[ ]:


# Klassen an entsprechende URLs binden
api.add_resource(getSessionsOrAddNew, '/session')
api.add_resource(getOrUpdateSpecificSession, '/session/<id>')

# Run für Testzwecke, startet auf localhost:5000
#if __name__ == "__main__":
 #   app.run()

# Run für Dockercontainer, mit Portangabe
if __name__ == "__main__":
    parser = optparse.OptionParser(usage="python server.py -p ")
    parser.add_option('-p', '--port', action='store', dest='port', help='The port to listen on.')
    (args, _) = parser.parse_args()
    if args.port == None:
        print "Missing required argument: -p/--port"
        sys.exit(1)
    app.run(host='0.0.0.0', port=int(args.port), debug=False)

