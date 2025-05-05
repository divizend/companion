# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Divizend Companion seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Email us at security@divizend.com** with details about the vulnerability
3. Include the following information:
   - Type of vulnerability
   - Steps to reproduce
   - Affected versions
   - Potential impact

Our security team will acknowledge receipt of your report within 48 hours and will send a more detailed response indicating the next steps in handling your submission.

After the initial reply, our team will keep you informed about the progress towards a fix and full announcement, and may ask for additional information or guidance.

## Security Measures

This application implements several security measures:

- Dependency scanning via Snyk and npm audit
- Static code analysis with ESLint security plugins
- Regular dependency updates with Dependabot
- Pre-commit and pre-build security checks
- CodeQL scanning for identifying code-level vulnerabilities

## Security Best Practices for Development

When contributing to this project, please follow these security best practices:

1. Keep all dependencies up to date
2. Avoid using `any` type in TypeScript
3. Do not store sensitive information in code or config files
4. Use environment variables for sensitive configuration
5. Follow the principle of least privilege
6. Validate all inputs, especially user inputs
7. Do not use `eval()` or similar functions
8. Be careful with dynamic requires and imports
