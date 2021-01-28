import json
data = json.loads(open('collected_data/password.json').read())
for d in data:
    print (d['password'])
