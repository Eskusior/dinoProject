#!/usr/bin/env python
# coding: utf-8

# In[1]:


import asyncio
import json
import logging
import websockets
import time
import requests

logging.basicConfig()

usersWithoutID = set() # Array für User ohne zugeordnete ID

usersWithID = set() # Array für User mit ID

sessionLogs = set()

# Klasse für einen User
class user:
    session_id = 0
    canControl = False
    def __init__(self, id, control, websocket):
        self.session_id = id
        self.canControl = control
        self.websocket = websocket

# Klasse für eine Logdatei
class sessionLog:
    session_id = 0
    time_data = []
    def __init__(self, id):
        self.session_id = id


# In[2]:


# JSON String erstellen
def messageToJSON(message):
    return json.dumps(message)

# Message an alle User der Session senden
async def sendMessageToSession(sessionID, message):
    if usersWithID:
        for user in usersWithID:
            if (user.session_id == sessionID):
                ws = user.websocket
                messJson = messageToJSON(message)
                await ws.send(messJson)
            
# Einem Nutzer eine Nachricht übermitteln
async def sendMessageToUser(websocket, message):
    messJson = messageToJSON(message)
    await websocket.send(messJson)

# Messageobjekt erstellen
async def generateMessage(sessionID, mType, mData):
    message = {
        "sessionID" : sessionID,
        "type": mType,
        "message": mData,
        "timestamp": int(round(time.time() * 1000)) # Timestamp in Millisekunden
    }
    
    return message

# Input an Session senden
async def sendCanvasUpdate(sessionID, canvasData):
    newMessage = await generateMessage(sessionID, 'update', canvasData)
    await sendMessageToSession(sessionID, newMessage)

# Überprüfe, ob es in der Session schon eine Person mit Steuerrechten gibt
async def getControlStatus(sessionID):
    controller = [user for user in usersWithID if (user.session_id == sessionID and user.canControl == True)]
    #print(len(controller))
    if(len(controller) == 0):
        return True # Return Steuerrechte für Nutzer
    else:
        return False # Keine Rechte

# Steuerrechte des Nutzers aktualisieren
async def changeControlStatus(sessionID, websocket):
    if(await getControlStatus(sessionID)):
        for oldUser in usersWithID.copy():
            if(oldUser.websocket == websocket and oldUser.session_id == sessionID):
                tmpUser = user(sessionID, True, websocket)
                usersWithID.remove(oldUser)
                usersWithID.add(tmpUser)
                await sendMessageToNewPlayer(tmpUser.session_id, tmpUser.websocket)
            
# Wenn Spieler aus Session geht, Spieler benachrichtigen und neuen Spieler suchen   
async def sendMessageForNewController(sessionID):
    newMessage = await generateMessage(sessionID, 'beController', 'Neuer Spieler werden?')
    await sendMessageToSession(sessionID, newMessage)

# User mitteilen, dass er neuer Spieler ist
async def sendMessageToNewPlayer(sessionID, websocket):
    newMessage = await generateMessage(sessionID, 'isNewController', 'Sie haben die Steuerung übernommen!')
    await sendMessageToUser(websocket, newMessage)

# Zu einer Session einen neuen Zeitwert hinzufügen
async def logNewTime(sessionID, timeOffset):
    if sessionLogs:
        for session in sessionLogs.copy():
            if(session.session_id == sessionID):
                session.time_data.append(timeOffset)
                
# Wenn alle Spieler aus Session raus --> Log an Backend senden
async def sendLogDataToBackend(sessionID):
    #url = 'http://webengineering.ins.hs-anhalt.de:32193/log/' + sessionID
    url = 'http://webengineering.ins.hs-anhalt.de:32193/log/' + sessionID
    if sessionLogs:
        for session in sessionLogs.copy():
            if(session.session_id == sessionID):
                httpData = {
                    "sessionID": sessionID,
                    "timeData": session.time_data
                }
                headers = {'content-type': 'application/json'}
                requests.put(url, data=json.dumps(httpData), headers=headers)
                sessionLogs.remove(session)

# Überprüft, ob noch Nutzer einer Session vorhanden sind
async def checkUserArrayOnSession(sessionID):
    if usersWithID:
        for user in usersWithID:
            if user.session_id == sessionID:
                return True
            
    return False
                
# Registriere neuen Nutzer ohne ID
async def registerUserWithoutID(websocket):
    usersWithoutID.add(websocket)
            
# Registriere neuen Nutzer mit ID
async def registerUserWithID(websocket, sessionID):
    canControl = await getControlStatus(sessionID) # Steuerstatus holen
    newUser = user(sessionID, canControl, websocket)
    usersWithID.add(newUser)
    await unregisterUserWithoutID(websocket)
    # Registrierungsnachricht an User mit Steuerrechten
    if(canControl):
        newMessage = await generateMessage(sessionID, 'registered control', 'Nutzer wurde mit Steuerrechten registriert')
        # Wenn neue Sesssion, oder Session neu geladen --> Log erstellen
        newSessionLog = sessionLog(sessionID)
        sessionLogs.add(newSessionLog)
    else:
        newMessage = await generateMessage(sessionID, 'registered noControl', 'Nutzer wurde ohne Steuerrechten registriert')
        
    await sendMessageToUser(websocket, newMessage)
    
# Entferne Nutzer ohne ID
async def unregisterUserWithoutID(websocket):
    if(websocket in usersWithoutID):
        usersWithoutID.remove(websocket)

# Entferne Nutzer mit ID
async def unregisterUser(websocket):
    wasController = False
    session_id = 0
    for index, user in enumerate(usersWithID.copy()):
        if(user.websocket == websocket):
            
            if(user.canControl):
                wasController = True
                session_id = user.session_id
                
            usersWithID.remove(user)
    await unregisterUserWithoutID(websocket)
    
    # Wenn User der Spieler war --> neuen Spieler anfordern
    if(wasController and await checkUserArrayOnSession(session_id)):
        await sendMessageForNewController(session_id)
    elif not await checkUserArrayOnSession(session_id):
        await sendLogDataToBackend(session_id)

# Auswerten der empfangenen Nachricht
async def evaluateMessage(message, websocket):
    # Registrieren als neuer Nutzer mit ID
    print(message["action"])
    if message["action"] == "register":
        await registerUserWithID(websocket, message["sessionID"])
    elif message["action"] == 'setControl':
        await changeControlStatus(message["sessionID"], websocket)
    elif message["action"] == 'update':
        await sendCanvasUpdate(message["sessionID"], message["canvasData"])
    elif message["action"] == 'log':
        await logNewTime(message['sessionID'], message['timeOffset'])
    else:
        logging.error("unsupported event: {}", message)
    
async def wsServer(websocket, path):
    await registerUserWithoutID(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            await evaluateMessage(data, websocket)
    finally:
        await unregisterUser(websocket)


# In[ ]:





# In[3]:


start_server = websockets.serve(wsServer, host="0.0.0.0", port="6789")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


