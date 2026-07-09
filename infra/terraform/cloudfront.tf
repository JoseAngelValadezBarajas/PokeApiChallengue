resource "aws_cloudfront_distribution" "api" {
  enabled             = true
  comment             = "${local.name_prefix} API distribution"
  default_root_object  = ""
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_lb.api.dns_name
    origin_id   = "${local.name_prefix}-alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy  = "http-only"
      origin_ssl_protocols    = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.name_prefix}-alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress                = true

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.common_tags
}
