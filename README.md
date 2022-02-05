Crear los contenedores

```
$ docker-compose build
```

Iniciar mysql

```
$ mkdir db_data
$ docker-compose up db
```

Obtener id de mysql

```
$ docker ps
CONTAINER ID  IMAGE      COMMAND  CREATED    STATUS    PORTS     NAMES
811a8037901e  mysql:5.7  "dock…"  54 sec...  Up 51...  3306...   rpa-linkedin_db_1
```

Copiar query_tables.sql en el contenedor, entrar y ejecutar
```
$ docker cp query_tables.sql 811a8037901e:/query_tables.sql
$ docker exec -it 811a8037901e bash
$ mysql -u root -p

mysql> source query_tables.sql;
```

Ejecutar npm install en backend:
```
docker-compose run rpa-backend bash -c "npm install && chown node /home/node/app/node_modules && chmod 775 /home/node/app/node_modules"
```

Ejecutar npm install en frontend:
```
docker-compose run rpa-frontend bash -c "npm install && chown node /home/node/app/node_modules && chmod 775 /home/node/app/node_modules"
```

Iniciar backend:
```
docker-compose up rpa-backend
```

Iniciar frontend:
```
docker-compose up rpa-frontend
```

Iniciar selenium (modo debug):
```
docker-compose up selenium
```

Conectarse a selenium por escritorio remoto:
- Abrir vncviewer
- Conectarse a 127.0.0.1:5900
- password: "secret"

Iniciar script python de extracción:
```
docker-compose up rpa-scrapper
```








