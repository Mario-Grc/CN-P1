FROM public.ecr.aws/lambda/nodejs:18

# Crea un directorio para tu función dentro del contenedor Lambda
WORKDIR ${LAMBDA_TASK_ROOT}

# Copia el archivo principal de la Lambda (create.js)
COPY ./lambdas/create_animal/create.js ./create.js
COPY ./lambdas/shared/postgres_db.js ./postgres_db.js
COPY ./lambdas/shared/lambda-helpers.js ./lambda-helpers.js
COPY ./lambdas/shared/animal.js ./animal.js

COPY ./package*.json ./
RUN npm install --omit=dev

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "create.handler" ]