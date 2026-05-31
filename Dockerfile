# Use an official, lightweight Java 17 base image
FROM eclipse-temurin:17-jdk-alpine

# Set environment variables
ENV MULE_HOME=/opt/mule \
    MULE_VERSION=4.4.0 \
    APP_PORT=8081

# Install required packages
RUN apk update && apk add --no-cache curl bash unzip tar

# Download and extract the public community/standalone Mule runtime
RUN cd /opt && \
    curl -fsSL -o mule.zip https://repository-master.mulesoft.org/nexus/content/repositories/releases/org/mule/distributions/mule-standalone/${MULE_VERSION}/mule-standalone-${MULE_VERSION}.zip && \
    unzip -q mule.zip && \
    mv mule-standalone-${MULE_VERSION} mule && \
    rm mule.zip && \
    chmod +x $MULE_HOME/bin/mule

# Copy the compiled Mule application jar into the apps directory
COPY target/*.jar $MULE_HOME/apps/

# Expose the application port
EXPOSE 8081

WORKDIR $MULE_HOME

# Start the Mule runtime in foreground console mode
CMD ["sh", "-c", "./bin/mule -M -Dhttp.port=${PORT:-8081}"]
