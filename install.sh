echo  `sudo rm -rf EDISS`

echo `sudo unzip $1`

printf '%s\n' "-n" `cd EDISS`

printf '%s\n' "-n" `sudo npm install express`

printf '%s\n' "-n" `sudo npm install express`

printf '%s\n' "-n" `sudo npm install mysql`

printf '%s\n' "-n" `sudo npm install winston`

printf '%s\n' "-n" `sudo npm install body-parser`

printf '%s\n' "-n" `sudo npm install client-sessions`

printf '%s\n' "-n" `sudo npm install forever`

printf '%s\n' "-n" `node EDISS/server.js`
