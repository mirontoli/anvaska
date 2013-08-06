Just a simple time tracking application, for discovering of Mongo and Node.js
and knockout.js.

The app is published on heroku

- http://anvaska.herokuapp.com

to start on your local machine install mongo db (google for more info):

    sudo apt-get install mongodb 
    sudo mkdir -p /data/db/
    sudo chown `id -u` /data/db

then install all needed node packages:

   npm install

And then run:

   node server.js
