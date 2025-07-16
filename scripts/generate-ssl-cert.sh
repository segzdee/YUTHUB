#!/bin/bash

# SSL Certificate Generation Script for yuthub.com
# This script generates SSL certificates for development and production use

set -e

echo "🔒 SSL Certificate Generation for yuthub.com"
echo "=============================================="

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Function to generate self-signed certificate
generate_self_signed() {
    echo "🛠️  Generating self-signed certificate..."
    
    openssl req -x509 -newkey rsa:4096 \
        -keyout ssl/server.key \
        -out ssl/server.crt \
        -days 365 \
        -nodes \
        -subj "/C=GB/ST=England/L=London/O=YUTHUB/OU=IT Department/CN=yuthub.com/emailAddress=admin@yuthub.com" \
        -addext "subjectAltName=DNS:yuthub.com,DNS:www.yuthub.com,DNS:yuthub.replit.app,DNS:localhost"
    
    echo "✅ Self-signed certificate generated successfully"
}

# Function to generate Let's Encrypt certificate
generate_letsencrypt() {
    echo "🛠️  Generating Let's Encrypt certificate..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "❌ Certbot not found. Please install certbot first:"
        echo "   sudo apt update && sudo apt install certbot"
        exit 1
    fi
    
    # Generate certificate
    sudo certbot certonly --standalone \
        -d yuthub.com \
        -d www.yuthub.com \
        --email admin@yuthub.com \
        --agree-tos \
        --non-interactive
    
    # Copy certificates to project directory
    sudo cp /etc/letsencrypt/live/yuthub.com/fullchain.pem ssl/server.crt
    sudo cp /etc/letsencrypt/live/yuthub.com/privkey.pem ssl/server.key
    
    echo "✅ Let's Encrypt certificate generated successfully"
}

# Function to set proper permissions
set_permissions() {
    echo "🔧 Setting certificate permissions..."
    
    chmod 600 ssl/server.key
    chmod 644 ssl/server.crt
    
    echo "✅ Certificate permissions set"
}

# Function to validate certificate
validate_certificate() {
    echo "🔍 Validating certificate..."
    
    # Check certificate validity
    if openssl x509 -in ssl/server.crt -text -noout > /dev/null 2>&1; then
        echo "✅ Certificate is valid"
        
        # Display certificate information
        echo "📋 Certificate Information:"
        openssl x509 -in ssl/server.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:|DNS:)"
    else
        echo "❌ Certificate validation failed"
        exit 1
    fi
}

# Function to create environment configuration
create_env_config() {
    echo "🔧 Creating environment configuration..."
    
    cat > .env.ssl << EOF
# SSL Configuration
HTTPS_ENABLED=true
SSL_CERT_PATH=./ssl/server.crt
SSL_KEY_PATH=./ssl/server.key
SSL_PORT=443

# Database SSL
DATABASE_SSL=true
DATABASE_URL_SSL=\${DATABASE_URL}?sslmode=require
EOF
    
    echo "✅ Environment configuration created (.env.ssl)"
}

# Main execution
main() {
    case "${1:-self-signed}" in
        "self-signed")
            generate_self_signed
            ;;
        "letsencrypt")
            generate_letsencrypt
            ;;
        *)
            echo "Usage: $0 [self-signed|letsencrypt]"
            echo "  self-signed: Generate self-signed certificate (default)"
            echo "  letsencrypt: Generate Let's Encrypt certificate"
            exit 1
            ;;
    esac
    
    set_permissions
    validate_certificate
    create_env_config
    
    echo ""
    echo "🎉 SSL Certificate installation completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update your application to use HTTPS"
    echo "2. Configure your web server (if using one)"
    echo "3. Test the SSL configuration"
    echo "4. Set up automatic renewal (for Let's Encrypt)"
    echo ""
    echo "To test the certificate:"
    echo "  openssl s_client -connect yuthub.com:443 -servername yuthub.com"
    echo ""
}

# Run main function with all arguments
main "$@"