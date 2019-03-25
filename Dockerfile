FROM centos:7

RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install -y nodejs
RUN node -v
#yarn
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
RUN yum install -y yarn
# Set up mongodb yum repo entry
RUN echo -e "\
[mongodb-org-4.0]\n\
name=MongoDB Repository\n\
baseurl=https://repo.mongodb.org/yum/redhat/7/mongodb-org/4.0/x86_64/\n\
gpgcheck=1\n\
enabled=1\n\
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc\n" >> /etc/yum.repos.d/mongodb.repo

# Install mongodb
RUN yum update -y && yum install -y mongodb-org

COPY server.js /home/server.js
COPY start.sh  /home/start.sh
COPY package.json  /home/package.json
COPY matches.json  /home/matches.json

# Install js dependencies
RUN cd /home
RUN yarn

RUN ls -la
RUN pwd

EXPOSE 3000

#ENTRYPOINT "ls -la && cd ./home  && sh start.sh" && /bin/bash
ENTRYPOINT ["sh", "/home/start.sh"]
