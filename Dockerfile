# MuleSoft ESB Application Dockerfile
FROM mulesoft/mule:4.4.0-java17-latest

# Set working directory
WORKDIR /opt/mule/apps

# Copy the built Mule artifact from the target directory
COPY target/*.jar ./

# Expose Mule's default HTTP port
EXPOSE 8081

# Set environment variables
ENV MULE_HOME=/opt/mule
ENV MULE_BASE=/opt/mule

# Start Mule runtime
CMD ["mule", "-M", "-Dmule.env=prod"]
