variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "pokemon-app"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "api_image_uri" {
  type    = string
  default = ""
}

variable "api_container_port" {
  type    = number
  default = 4000
}

variable "api_desired_count" {
  type    = number
  default = 1
}

variable "api_cpu" {
  type    = number
  default = 256
}

variable "api_memory" {
  type    = number
  default = 512
}

variable "pokeapi_base_url" {
  type    = string
  default = "https://pokeapi.co/api/v2"
}

variable "cache_ttl_seconds" {
  type    = number
  default = 3600
}

variable "allowed_cors_origins" {
  type    = string
  default = "http://localhost:3000"
}
