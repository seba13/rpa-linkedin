FROM node:12

ENV NPM_CONFIG_LOGLEVEL info

RUN mkdir -p /home/node/app/node_modules \
    && chown node /home/node/app \
    && chmod -R 775 /home/node/app

RUN npm install -g nodemon 

VOLUME /home/node/app

USER node
WORKDIR /home/node/app/

# COPY package*.json ./

# user root
# # RUN npm install
# RUN npm install
# RUN chown node /home/node/app/node_modules \
#     && chmod -R 775 /home/node/app/node_modules

# COPY . .

EXPOSE 3002
# CMD [ "node", "app.js" ]