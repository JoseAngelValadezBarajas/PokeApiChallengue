# Terraform Deployment Guide

This folder defines AWS infrastructure for the backend API using Terraform.

## Prerequisites

Install and verify these tools first:

- AWS CLI v2
- Terraform >= 1.5
- Docker Desktop

Recommended quick checks:

```bash
aws --version
terraform version
docker --version
```

Authenticate AWS CLI before running Terraform:

```bash
aws configure
aws sts get-caller-identity
```

## If you start from zero in AWS

If you do not have Terraform backend resources yet, create these first:

1. S3 bucket for Terraform state
2. DynamoDB table for Terraform state lock

Example commands:

```bash
aws s3api create-bucket --bucket <tf-state-bucket> --region <aws-region> --create-bucket-configuration LocationConstraint=<aws-region>
aws s3api put-bucket-versioning --bucket <tf-state-bucket> --versioning-configuration Status=Enabled

aws dynamodb create-table \
	--table-name <tf-lock-table> \
	--attribute-definitions AttributeName=LockID,AttributeType=S \
	--key-schema AttributeName=LockID,KeyType=HASH \
	--billing-mode PAY_PER_REQUEST \
	--region <aws-region>
```

If your region is `us-east-1`, create the S3 bucket without `--create-bucket-configuration`.

Minimum IAM permissions needed by your AWS user/role:

- S3 (bucket/object for state)
- DynamoDB (table lock)
- ECR
- ECS
- ALB/EC2 networking
- CloudWatch Logs
- IAM (limited role pass/create as required)

## What this creates

- VPC with public subnets, route table, and internet gateway
- ECR repository for the API image
- ECS Fargate cluster, task definition, and service
- Application Load Balancer and target group
- CloudWatch log group
- IAM role for ECS task execution
- CloudFront distribution in front of the ALB

## Main variables

- `aws_region`
- `project_name`
- `environment`
- `api_image_uri`
- `api_container_port`
- `api_desired_count`
- `api_cpu`
- `api_memory`
- `pokeapi_base_url`
- `cache_ttl_seconds`
- `allowed_cors_origins`

Defaults are declared in `variables.tf` and environment-specific values are usually set in `terraform.tfvars`.

## Files to edit before deploy

1. `terraform.tfvars`
2. `backend.tf` is already configured with `backend "s3" {}`

Minimum `terraform.tfvars` values to verify:

- `aws_region`
- `api_image_uri`
- `allowed_cors_origins`

Notes:

- `allowed_cors_origins` should be your frontend domain (for example Vercel URL).
- `api_image_uri` must point to an image that exists in ECR.

## Quick decision flow

Use this when you are unsure what to run next:

1. No backend yet (S3/DynamoDB missing): create them first, then run `terraform init`.
2. No ECR repo yet: run `terraform apply -target=aws_ecr_repository.api`.
3. ECR repo exists but no API image: build/tag/push image.
4. Image exists: run full `terraform apply` with `api_image_uri`.
5. Infrastructure is up: validate `/health` and update frontend env var.

## Backend state

This project is configured to use a remote S3 backend (`backend.tf`):

```hcl
terraform {
	backend "s3" {}
}
```

Initialize with backend config arguments (bucket/key/region/dynamodb_table) in your environment.

If this is your first time with Terraform backend config, use this mapping:

- `bucket`: your S3 bucket name used for Terraform state.
	Example: `pokemon-app-tf-state`
- `key`: path (file name) of the state object inside the bucket.
	Example: `pokemon-app/dev/terraform.tfstate`
- `region`: AWS region where bucket/table exist.
	Example: `us-west-1`
- `dynamodb_table`: DynamoDB table used for Terraform state locking.
	Example: `pokemon-app-tf-locks`

You need all four values from your own AWS account.

Quick checklist before running `terraform init`:

1. S3 bucket exists.
2. DynamoDB table exists (with lock ID/hash key).
3. Both are in the same AWS region you are using.
4. AWS CLI is authenticated (`aws configure` done with correct account).

Optional checks (recommended):

```bash
aws s3 ls s3://<tf-state-bucket>
aws dynamodb describe-table --table-name <tf-lock-table> --region <aws-region>
```

## Deployment flow (recommended)

1. Go to Terraform folder.
2. Initialize Terraform with remote backend config.
3. Create ECR repository (first time only).
4. Build and push backend image to ECR.
5. Apply full Terraform with a valid `api_image_uri`.
6. Copy `cloudfront_api_url` output.
7. Set Vercel `NEXT_PUBLIC_API_BASE_URL` to that CloudFront URL.

## First-time deploy (quick start)

1. `cd infra/terraform`
2. `terraform init` with backend config
3. `terraform apply -target=aws_ecr_repository.api`
4. Get ECR repository URL with `terraform output -raw ecr_repository_url`
5. Build and push API image to ECR
6. `terraform apply -var="api_image_uri=<ecr_repository_url>:latest"`
7. Get CloudFront API URL with `terraform output -raw cloudfront_api_url`
8. Set Vercel `NEXT_PUBLIC_API_BASE_URL` to that CloudFront URL
9. Validate outputs and health endpoint

## Existing project deploy (already initialized)

If this is not your first deployment:

1. Build and push new backend image tag
2. Run `terraform apply -var="api_image_uri=<ecr_repository_url>:<new-tag>"`
3. Validate health endpoint and frontend integration

## Where each value comes from

Before `docker login`, collect these values:

1. AWS account id:

```bash
aws sts get-caller-identity --query Account --output text
```

2. AWS region:

```bash
aws configure get region
```

3. ECR repository URL (created by Terraform):

```bash
terraform output -raw ecr_repository_url
```

You do not invent `ecr_repository_url`; Terraform returns it after creating ECR.

CloudFront URL for frontend environment variable:

```bash
terraform output -raw cloudfront_api_url
```

Use that value in Vercel as `NEXT_PUBLIC_API_BASE_URL`.

## Example commands

```bash
cd infra/terraform

# 0) Resolve runtime values used below
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

# 1) Init remote backend
terraform init \
	-backend-config="bucket=<tf-state-bucket>" \
	-backend-config="key=pokemon-app/dev/terraform.tfstate" \
	-backend-config="region=${AWS_REGION}" \
	-backend-config="dynamodb_table=<tf-lock-table>"

# 2) Create ECR first time
terraform apply -target=aws_ecr_repository.api

# 3) Get ECR URL (this is the value used in <ecr_repository_url>)
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)

# 4) Authenticate Docker to ECR
# Do NOT run docker login by itself; it must receive token from aws ecr get-login-password.
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# 5) Build, tag, and push API image
docker build -t pokemon-api ../../apps/api
docker tag pokemon-api:latest ${ECR_REPOSITORY_URL}:latest
docker push ${ECR_REPOSITORY_URL}:latest

# 6) Apply full stack (or update task definition image)
terraform apply -var="api_image_uri=${ECR_REPOSITORY_URL}:latest"
```

### PowerShell version (copy/paste)

```powershell
cd C:/Dev/PokeApiChallengue/infra/terraform

$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$AWS_REGION = aws configure get region

terraform init -backend-config="bucket=YOUR_TF_STATE_BUCKET" -backend-config="key=pokemon-app/dev/terraform.tfstate" -backend-config="region=YOUR_AWS_REGION" -backend-config="dynamodb_table=YOUR_TF_LOCK_TABLE"

terraform apply -target=aws_ecr_repository.api
$ECR_REPOSITORY_URL = terraform output -raw ecr_repository_url

# Authenticate Docker to ECR (do not run docker login alone)
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

docker build -t pokemon-api ../../apps/api
docker tag pokemon-api:latest "$ECR_REPOSITORY_URL:latest"
docker push "$ECR_REPOSITORY_URL:latest"

terraform apply -var="api_image_uri=$ECR_REPOSITORY_URL:latest"
```

Replace these placeholders:

- `YOUR_TF_STATE_BUCKET`
- `YOUR_AWS_REGION`
- `YOUR_TF_LOCK_TABLE`

If backend was initialized before and you changed values, run:

```bash
terraform init -reconfigure
```

Windows PowerShell equivalent:

```powershell
terraform init -reconfigure
```

## Useful outputs

- `ecr_repository_url`
- `ecs_cluster_name`
- `ecs_service_name`
- `alb_dns_name`
- `cloudfront_api_url`

Get outputs:

```bash
terraform output
```

Get only API URL:

```bash
terraform output -raw cloudfront_api_url
```

## Post-deploy validation

Check API health via CloudFront URL:

```bash
curl -i <cloudfront_api_url>/health
curl -i "<cloudfront_api_url>/pokemons"
```

Expected:

- `/health` returns `200` with `{ "status": "ok" }`
- `/pokemons` returns `200` with a JSON array of objects containing `name`, `types`, and `image`

PowerShell checks:

```powershell
Invoke-WebRequest -Uri "<cloudfront_api_url>/health" -UseBasicParsing
Invoke-WebRequest -Uri "<cloudfront_api_url>/pokemons" -UseBasicParsing
```

## Updating backend image (normal release flow)

When backend code changes:

1. Build and push a new image tag to ECR.
2. Update `api_image_uri` (in `terraform.tfvars` or with `-var`).
3. Run `terraform apply`.

Example:

```bash
docker build -t pokemon-api ../../apps/api
docker tag pokemon-api:latest <ecr_repository_url>:v2
docker push <ecr_repository_url>:v2
terraform apply -var="api_image_uri=<ecr_repository_url>:v2"
```

## Rollback

Fast rollback uses the previous known-good image tag:

```bash
terraform apply -var="api_image_uri=<ecr_repository_url>:<previous-tag>"
```

## Common errors and fixes

1. `Error acquiring the state lock`
	Cause: another Terraform operation still holds lock.
	Fix: wait for the running process; only use force-unlock if you are sure no apply is running.

2. `No valid credential sources found`
	Cause: AWS CLI/auth not configured.
	Fix: run `aws configure` and verify with `aws sts get-caller-identity`.

3. ECS tasks restart with image pull or startup errors
	Cause: wrong `api_image_uri` or bad image.
	Fix: verify image exists in ECR and redeploy valid tag.

4. Frontend CORS errors
	Cause: `allowed_cors_origins` does not match frontend URL.
	Fix: update variable, apply, then invalidate CloudFront cache if needed.

## Safe cleanup

To destroy all managed resources:

```bash
terraform destroy
```

Only run this if you intentionally want to remove infrastructure.

## Notes

- ECS task env vars are injected from Terraform variables (`ecs.tf`).
- CloudFront forwards CORS-related headers required by browser preflight requests.
- Do not commit `terraform.tfstate`, `terraform.tfstate.backup`, or `.terraform/` artifacts.
- Keep `.terraform.lock.hcl` committed (provider version lock file).
