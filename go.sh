# A Script that starts the Express Node App on port 9000 and React on port 3000

startNode () {
  echo "starting Node"
  cd api
  node ./bin/www
}

startReact () {
  echo "starting React"
  cd client
  npm start
}

startNode &
startReact &
