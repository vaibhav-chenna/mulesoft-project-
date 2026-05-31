#!/bin/bash
# Docker Build Helper Script for MuleSoft Application
# This script builds the Docker image for the MuleSoft Mule application

set -e

echo "==================================="
echo "MuleSoft Docker Build Helper"
echo "==================================="

# Check if target JAR exists
if [ ! -f "target/ai-support-api-1.0.0.jar" ] && [ -z "$(ls target/*.jar 2>/dev/null)" ]; then
    echo ""
    echo "⚠️  WARNING: No compiled JAR found in target/"
    echo ""
    echo "Please compile the Mule application first:"
    echo "  mvn clean package"
    echo ""
    read -p "Continue without JAR? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set image name and tag
IMAGE_NAME="${1:-mulesoft-app}"
IMAGE_TAG="${2:-1.0}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo ""
echo "Building Docker image: $FULL_IMAGE_NAME"
echo ""

# Build the Docker image
docker build -t "$FULL_IMAGE_NAME" .

echo ""
echo "✅ Docker image built successfully: $FULL_IMAGE_NAME"
echo ""
echo "To run the container:"
echo "  docker run -p 8081:8081 $FULL_IMAGE_NAME"
echo ""
echo "To push to a registry:"
echo "  docker tag $FULL_IMAGE_NAME <registry>/<image>:latest"
echo "  docker push <registry>/<image>:latest"
echo ""
