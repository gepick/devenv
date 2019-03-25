cd ./home

echo "IMPORTING DATA TO DATABASE"
mkdir /data
mkdir /data/mongodb

/usr/bin/mongod --port 27017 --dbpath /data/mongodb --pidfilepath /var/run/mongodb/mongod.pid &
mongoimport --db gepick --collection matches --file matches.json
mongoimport --db gepick --collection results --file results.json

echo "HELLO FROM SH FILE!"
ls -la
yarn

node ./server.js
