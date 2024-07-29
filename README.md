
# Vidsyncro


### Demonstration: https://www.youtube.com/watch?v=bU4bNd35Rb0

## Overview

Vidsyncro is a serverless video publishing platform which takes videos as input and produces production grade assets like subtitles, transcoded dash package. It also generates suitable title, description and social media post.

- Collaborative platform for editors and creators
- Automated production pipelines (transcoding, subtitle generation, thumbnail generation)
- Secure management and API services
- Social integrations for direct uploads to platforms like YouTube
- Optimized review process using EDLs and other short formats

## Architecture

![image](https://github.com/nikhil-babar/vidsyncro-backend/assets/115392530/45229c6b-beb3-4efc-b248-dc8c7bc0bb27)

## Tech Stack

- AWS Lambda
- Node.js
- AWS SAM (Serverless Application Model)
- AWS S3
- AWS Fargate

## Challenges

- Handling EDLs when folder structures or assets are modified
- Competition with existing services like Vimeo, Frame.io
- Synchronizing local and cloud storage

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Docker](https://www.docker.com/products/docker-desktop)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nikhil-babar/vidsyncro-backend.git
   cd vidsyncro-backend
   ```

2. **Build the project:**

   ```bash
   sam build
   ```

3. **Run the API locally:**

   ```bash
   sam local start-api
   ```

4. **Create AWS resources:**

   - **ECS Cluster:**
     Create an ECS Cluster through the AWS Management Console or using AWS CLI.

   - **S3 Bucket:**
     Create an S3 bucket through the AWS Management Console or using AWS CLI.

5. **Configure SAM and environment variables:**

   Update the SAM configuration file and environment variables with your AWS credentials, ARNs, and resource names.

   Example for `.env`:
   ```env
        SECRET_KEY: <YOUR_SECRET_KEY>
        REGION: <YOUR_REGION>
        SNS_TOPIC: arn:aws:sns:<YOUR_REGION>:<YOUR_ACCOUNT_ID>:<YOUR_SNS_TOPIC_NAME>
        CLUSTER: <YOUR_CLUSTER_NAME>
        CLUSTER_SUBNET: <YOUR_CLUSTER_SUBNET_ID>
        CLUSTER_SECURITY_GROUP: <YOUR_SECURITY_GROUP_ID>
        VIDEO_BUCKET: <YOUR_VIDEO_BUCKET_NAME>
        URL_EXPIRATION_SECONDS: <YOUR_URL_EXPIRATION_SECONDS>
        MONGO_URL: <YOUR_MONGO_URL>
        MONGO_DB_NAME: <YOUR_MONGO_DB_NAME>
        API_GATEWAY_URL: <YOUR_API_GATEWAY_URL>
        FRONTEND_END: <YOUR_FRONTEND_END_URL>
        SES_IDENTITY_ARN: arn:aws:ses:<YOUR_REGION>:<YOUR_ACCOUNT_ID>:identity/<YOUR_SES_IDENTITY>
        EMAIL: <YOUR_EMAIL>
        ASSEMBLY_API_KEY: <YOUR_ASSEMBLY_API_KEY>
        HUGGINGFACE_API_KEY: <YOUR_HUGGINGFACE_API_KEY>
        GEMINI_API_KEY: <YOUR_GEMINI_API_KEY>
        GOOGLE_CLIENT_ID: <YOUR_GOOGLE_CLIENT_ID>
   ```

6. **Start the API locally again (if necessary):**

   ```bash
   sam local start-api
   ```

7. **Test API endpoints:**

   Use tools like Postman or cURL to test the API endpoints and verify the integration with MongoDB.

## Contributing

To contribute to this project, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Create a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or suggestions, please reach out to [nikhilbabarjee@gmail.com](mailto:your-email@example.com).

--
