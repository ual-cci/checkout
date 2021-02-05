FROM nginx:alpine

COPY config /etc/nginx
RUN mkdir /etc/nginx/sites-enabled
RUN ln -s /etc/nginx/sites-available/checkout.conf /etc/nginx/sites-enabled/

EXPOSE 80
EXPOSE 443
