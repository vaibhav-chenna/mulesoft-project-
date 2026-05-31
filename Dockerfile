# Use an official, lightweight Java 17 base image
FROM eclipse-temurin:17-jdk-alpine

# Set environment variables
ENV MULE_HOME=/opt/mule \
    MULE_VERSION=4.8.0 \
    APP_PORT=8086

# Install required packages
RUN apk update && apk add --no-cache curl bash unzip tar

# Download and extract the public community/standalone Mule runtime
RUN cd /opt && \
    curl -fsSL -o mule.zip https://repository-master.mulesoft.org/nexus/content/repositories/releases/org/mule/distributions/mule-standalone/${MULE_VERSION}/mule-standalone-${MULE_VERSION}.zip && \
    unzip -q mule.zip && \
    mv mule-standalone-${MULE_VERSION} mule && \
    rm mule.zip && \
    chmod +x $MULE_HOME/bin/mule

# Create apps directory
RUN mkdir -p $MULE_HOME/apps

# Copy the compiled Mule application jar into the apps directory (if it exists)
# Note: You must compile the Mule project with Maven before building this Docker image
# Run: mvn clean package
# Then build: docker build -t mulesoft-app:1.0 .
COPY target/*.jar $MULE_HOME/apps/ 2>/dev/null || true

# Expose the application port
EXPOSE ${APP_PORT}

WORKDIR $MULE_HOME

# Start the Mule runtime in foreground console mode
CMD ["sh", "-c", "./bin/mule -M -Dhttp.port=${PORT:-8086}"]
