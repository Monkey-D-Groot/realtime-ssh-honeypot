import asyncio
import websockets
import json
import redis
r = redis.Redis(host='localhost', port=6379, db=0)
from pymongo import MongoClient
client = MongoClient()
db = client['geoip']
summary_pass = db['summary_pass']
summary_country = db['summary_country']
summary_ip = db['summary_ip']
summary_username = db['summary_username']

def get_top(db,key):
    top = list(db.find().sort("count",-1))
    number = 4 if len(top) > 4 else len(top)
    res = []
    for t in top:
        if number == 0:
            break
        number -= 1
        res.append({key:t[key], "count" : t['count']})
    return res

async def hello(websocket, path):
    data = r.lindex("input",0) # I have another process for renew data, collect realtime ssh connect
    if data is None:
        return
    data = data.decode("utf-8")
    data = json.loads(data)
    top_ips = get_top(summary_ip,"ip")
    top_countries = get_top(summary_country,"country")
    top_passwords = get_top(summary_pass,"password")
    top_usernames = get_top(summary_username,"username")
    data['top_ips'] = top_ips
    data['top_countries'] = top_countries
    data['top_passwords'] = top_passwords;
    data['top_usernames'] = top_usernames;
    data = json.dumps(data)
    """sample data
    {
    "attackerCity": "Singapore", 
    "hash": "7b5ac0de1af6b180d787340d7fec722b733c3b18dfcffa4227397597528f8305", 
    "attackerIP": "178.128.221.162", 
    "attackerCountry": "SG", 
    "targetCountry": "SG", 
    "attackerLongitude": "103.850070", 
    "signatureName": "Tried to SSH with username: cgx and password c*** at 07-05-2020 16:26:30", 
    "targetLongitude": "103.800", 
    "hostHeader": "khuyenn.com", 
    "targetIP": "207.148.75.129", 
    "attackerLatitude": "1.289670", 
    "targetLatitude": "1.3667", 
    "top_ips": [{"ip": "222.186.52.78", "count": 11811}, {"ip": "45.136.108.85", "count": 4960}, {"ip": "185.153.196.230", "count": 4960}, {"ip": "49.88.112.76", "count": 2199}], 
    "top_countries": [{"country": "CN", "count": 98558}, {"country": "US", "count": 27372}, {"country": "FR", "count": 15887}, {"country": "DE", "count": 8052}], 
    "top_passwords": [{"password": "123456", "count": 11171}, {"password": "", "count": 3276}, {"password": "123", "count": 2722}, {"password": "password", "count": 1992}], 
    "top_usernames": [{"username": "root", "count": 101537}, {"username": "admin", "count": 8138}, {"username": "test", "count": 3353}, {"username": "ubuntu", "count": 2115}]}
    """
    await websocket.send(data)


start_server = websockets.serve(hello, "0.0.0.0", 8888)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
