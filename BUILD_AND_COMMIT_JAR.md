# Building and Committing the Compiled Mule Application JAR

This guide explains how to generate the compiled Mule application JAR file and commit it to GitHub.

## Prerequisites

- Anypoint Studio OR Maven 3.8+ installed
- Java JDK 11 or higher
- Git configured on your machine

## Building the Mule Application

### Option 1: Using Anypoint Studio

1. Open this project in Anypoint Studio
2. Right-click on the project → **Anypoint Studio** → **Export**
3. Select **Mule Deployable Archive (.jar)**
4. Save the JAR to the **root directory** of the project (e.g., `ai-support-api-1.0.0.jar`)

### Option 2: Using Maven

Run the following command in the project root directory:

```bash
mvn clean package
```

This will generate the JAR file: `target/ai-support-api-1.0.0.jar`

Once built, copy it to the project root:

```bash
cp target/ai-support-api-*.jar ./
```

## Committing the JAR to GitHub

After the JAR is in the root directory, commit and push it:

```bash
# Stage the JAR file
git add ai-support-api-*.jar

# Commit the change
git commit -m "Add compiled Mule application JAR for Docker build"

# Push to GitHub
git push origin master
```

## Docker Build

Once the JAR is committed, you can build the Docker image:

```bash
docker build -t mulesoft-app:1.0 .
docker run -p 8081:8081 mulesoft-app:1.0
```

The Dockerfile will automatically copy the JAR file into the Mule runtime container.

## Notes

- The `.gitignore` has been configured to allow `ai-support-api-*.jar` files
- Keep only the latest compiled JAR in the root directory to minimize repository size
- The JAR file should be regenerated whenever source code changes
