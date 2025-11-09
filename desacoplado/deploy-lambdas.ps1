# ==========================================================
# DEPLOY LAMBDAS
# ==========================================================

set DOCKER_BUILDKIT=0

# Configuracion fija
$Region = "us-east-1"
$RepoName = "animal-shelter-lambdas"
$StackName = "animal-shelter-ecr"
$AccountId = (aws sts get-caller-identity --query "Account" --output text)
$EcrUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepoName"

Write-Host "Cuenta AWS: $AccountId"
Write-Host "Repositorio ECR: $EcrUri"
Write-Host ""

# Crear el stack si no existe o actualizar si hay cambios.
Write-Host "Verificando/Creando repositorio ECR via CloudFormation..."
aws cloudformation deploy `
    --template-file ./ecr.yml `
    --stack-name "$StackName" `
    --parameter-overrides "RepositoryName=$RepoName" `
    --region $Region `
    --no-fail-on-empty-changeset

# Login a ECR
Write-Host "Autenticando Docker..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

# ==========================================================
# 1 - CREATE ANIMAL
# ==========================================================
Write-Host "`nBuild: create_animal"
docker build --platform linux/amd64 --provenance=false -t "${RepoName}:create-animal" -f ./lambdas/create_animal/Dockerfile .
docker tag "${RepoName}:create-animal" "${EcrUri}:create-animal"
docker push "${EcrUri}:create-animal"

# ==========================================================
# 2 - DELETE ANIMAL
# ==========================================================
Write-Host "`nBuild: delete_animal"
docker build --platform linux/amd64 --provenance=false -t "${RepoName}:delete-animal" -f ./lambdas/delete_animal/Dockerfile .
docker tag "${RepoName}:delete-animal" "${EcrUri}:delete-animal"
docker push "${EcrUri}:delete-animal"

# ==========================================================
# 3 - GET ALL ANIMALS
# ==========================================================
Write-Host "`nBuild: get_all_animals"
docker build --platform linux/amd64 --provenance=false -t "${RepoName}:get-animals" -f ./lambdas/get_all_animals/Dockerfile .
docker tag "${RepoName}:get-animals" "${EcrUri}:get-animals"
docker push "${EcrUri}:get-animals"

# ==========================================================
# 4 - GET ANIMAL BY ID
# ==========================================================
Write-Host "`nBuild: get_animal"
docker build --platform linux/amd64 --provenance=false -t "${RepoName}:get-animal-by-id" -f ./lambdas/get_animal/Dockerfile .
docker tag "${RepoName}:get-animal-by-id" "${EcrUri}:get-animal-by-id"
docker push "${EcrUri}:get-animal-by-id"

# ==========================================================
# 5 - UPDATE ANIMAL
# ==========================================================
Write-Host "`nBuild: update_animal"
docker build --platform linux/amd64 --provenance=false -t "${RepoName}:update-animal" -f ./lambdas/update_animal/Dockerfile .
docker tag "${RepoName}:update-animal" "${EcrUri}:update-animal"
docker push "${EcrUri}:update-animal"

Write-Host "`nTodas las imagenes fueron subidas correctamente a $EcrUri"