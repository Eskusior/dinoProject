# DinoProject
DinoProject ist eine Webanwendung zur exemplarischen Demonstration der Übertragungsgeschwindigkeit zwischen Websocket-Clienten und der einfachen Anbindung neuer Eingabemöglichkeiten.

## Einleitung
Das DinoProject ist, wie oben beschrieben, eine Webanwendung, welche im Zuge eines Hochschulprojektes entstanden ist. Die Webanwendung soll die Möglichkeit bieten die Übertragungsgeschwindigkeit von Websocketverbindungen zu messen und zu protokollieren. Gleichzeitig soll die einfache Anbindung neuer Steuerungsmöglichkeiten an das Spiel möglich sein, so dass neue HTML-Events sehr einfach an die bestehende Anwendung angebunden werden können.

## Komponentenübersicht

#### Webanwendung
Bei der Webanwendung handelt es sich um eine einfache Webapp, welche ohne Framework entwickelt wurde. Abseits der [index.html](./index.html) werden die Javascript-Dateien in [js/](./js/) und die CSS-Dateien in [css/](./css/) genutzt.

#### NGINX
Die Webanwendung wird durch einen NGINX zur Verfügung gestellt. Die zugehörige Konfiguration befindet sich in [NGINX/](./NGINX) . In der Konfiguration werden die MIME-Types angebunden, Header gesetzt und Port 80 genutzt. Desweiteren wird ein rewrite auf */game/* durchgeführt, um die Sessionerstellung zu ermöglichen. Die [docker-compose.yaml](./NGINX/docker-compose.yaml) , welche sich im gleichen Ordner befindet wird zur lokalen Ausführung des NGINX benutzt.

#### Backend
Das Backend ist eine in Python geschriebene Anwendung und befindet sich unter [Backend/](./Backend) . Das entsprechende [Jupyter Notebook](./Backend/Webserver_Notebook.ipynb) wurde zur Erstellung genutzt und später als [server.py](./Backend/server.py) exportiert. Das Backend ist für das Erstellen einer neuen Spielsession, als auch das Speichern und Abrufen von Highscores verantwortlich. Außerdem werden die entsprechenden Logdatein durch das Backend in die Datenbank geschrieben. Der im selben Ordner befindliche [Dockerfile](./Backend/Dockerfile) ist Ausgangspunkt für das erstellen des entsprechenden Dockercontainers für die server.py . Es werden im Container die Dependencies des Programms geladen und dann das Backend auf Port 5002 gestartet.

#### Websocket-Server
Der Websocket-Server ist ebenfalls in Python geschrieben und befindet sich unter [/Websocket](./Websocket) . Das [Jupyter Notebook](./Websocket/Websocket_Server.ipynb) im Ordner wurde als [wsServer.py](./Websocket/wsServer.py) exportiert. Der Websocket-Server ist für die Verteilung der Websocket-Nachrichten in den einzelnen Sessions zu verteilen. Hierzu wurde ein Sessionhandling für gleichzeitige Spielsessions eingebaut. Anhand der in der Nachricht mitgelieferten SessionID wird die Nachricht entsprechend weitergeleitet. Desweiteren wird der Websocket-Server zum loggen der Übertragungszeiten der Nachrichten genutzt. Hierzu wird ein Array mit den einzelnen übertragenen Zeiten gefüllt, und falls kein Nutzer mehr in der entsprechenden Session ist, die Daten an das Backend gesendet. Der Websocket-Server besitzt, ähnlich zum Backend, einen eigenen [Dockerfile](./Websocket/Dockerfile) und startet auf dem Port 6789.

#### Datenbank
Bei der Datenbank handelt es sich um eine MySQL. Diese besitzt zwei Tabellen: highscoreTable und logTable . Im highscoreTable wird, entsprechend des Namens, der Highscore zu einer Session gespeichert. In der logTable Tabelle werden dann zu den entsprechenden Tabellen die Logdateien als Textdateien gespeichert. Die Datenbank läuft standardmäßig auf Port 3306.

##### Adminer
Um Zugriff auf die Datenbank zu haben wird zusätzlich in der [docker-compose.yaml](./docker-compose.yaml) ein Adminer gestartet. Dieser kann jedoch entfert werden, falls er nicht benötigt wird.


## Konfiguration

Um die entsprechenden Dockercontainer zu starten, müssen noch einige Daten in den entsprechenden Dateien angepasst werden.

#### Javascript

Im Javascript müssen folgende URLs angepasst werden:

*scripts.js*
```javascript
var baseURL = "[URL des Backends]";
```

*websocket.js*
```javascript
var ws = new WebSocket('ws://[URL des Websocket-Servers]/');
```

#### Backend

In der *server.py* müssen folgende Daten angepasst werden:

```python
mydb = mysql.connector.connect(
    host = "[URL der Datenbank]",
    port = [Port der Datenbank],
    user = "[Username]",
    passwd = "[Passwort]",
    database = "dinoProject"
)
```
```python
class createSession(Resource):
    def post(self):
        sessionID = str(uuid.uuid4().hex)
        return redirect('http://[URL des Webservers]/game/' + sessionID, code=303)
```

#### Websocket-Server

In der *wsServer.py* müssen folgende Daten angepasst werden:

```python
async def sendLogDataToBackend(sessionID):
    url = 'http://[URL des Backends]/log/' + sessionID
```

#### docker-compose.yaml

In der *docker-compose.yaml* müssen schlussendlich noch die entsprechenden Ports angepasst werden.


## Start

Um die Webanwendung und zugehörige Abhängigkeiten zu starten genügt nun ein einfaches

```bash
docker-compose up -d
```

Dadurch werden die entsprechenden Dockercontainer erstellt und die Webapp sollte unter der angegebenen URL verfügbar sein.

## Anmerkungen

Dieses Projekt ist im Zuge des Wahlpflichtmoduls "Games & Application for Web & Mobile" im Studiengang "Angewandte Informatik" an der [Hochschule Anhalt](https://www.hs-anhalt.de/startseite.html) entstanden.