# adsensor_test

## start

```
docker-compose up --build
```

server: NodeJS, Express, Jest </br>
db: PostgreSQL</br>
client: React 18, MUI 6</br>

База данных пуста при первой загрузке, за исключением списка фильмов.</br></br>

Тесты запускаются при загрузке через файл entrypoint.sh, нет необходимости вручную запускать тестовый файл.
