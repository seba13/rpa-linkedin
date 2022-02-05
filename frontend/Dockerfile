# base image
FROM node:12

# install chrome for protractor tests
#RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
#RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
#RUN apt-get update && apt-get install -yq google-chrome-stable

# RUN apk update && apk upgrade && \
#     apk add --no-cache bash git openssh

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

RUN npm install -g @angular/cli@11.0.6
RUN npm install -g webpack webpack-dev-server

# RUN mkdir -p /home/node/app/node_modules \
#     && chown node /home/node/app \
#     && chmod -R 775 /home/node/app

VOLUME /home/node/app
# VOLUME /home/node/app/node_modules

USER node
# set working directory
WORKDIR /home/node/app

# RUN git config --global user.email "sebastian@analitic.cl" && \
#     git config --global user.name "sebastian"

# COPY package*.json ./

# user root
# # RUN npm install
# RUN npm install && npm cache clean --force
# RUN chown node /home/node/app/node_modules \
#     && chmod -R 775 /home/node/app/node_modules

