# Proof9 Backend API

This repository contains the backend API for Proof9, a creator-first platform that helps music creators protect their rights and connect with their audience.

## Tech Stack

-   **Runtime**: Bun
-   **Framework**: Hono, TypeScript
-   **Story Protocol**: @story-protocol/core-sdk
-   **Web3 Integration**: viem
-   **Validation**: zod, @hono/zod-validator
-   **Storage**: IPFS (via Pinata)
-   **Verification**: Yakoa API

## Features

-   Music IP verification with Yakoa
-   IP registration with Story Protocol
-   Derivative works management
-   License creation and management
-   Royalty distribution
-   Dispute resolution

## Getting Started

### Prerequisites

-   [Bun](https://bun.sh/) installed
-   Yakoa API key (get from [docs.yakoa.ai](https://docs.yakoa.ai))
-   Story Protocol account and wallet (on Aeneid testnet)
-   Pinata account for IPFS storage

### Installation

1. Clone this repository
2. Install dependencies
    ```bash
    bun install
    ```
3. Create a `.env` file based on `env.example`
    ```bash
    cp env.example .env
    ```
4. Update the `.env` file with your credentials
5. Start the development server
    ```bash
    bun run dev
    ```

## API Endpoints

### Verification API (Yakoa)

-   `POST /api/verification/verify-music`: Verify music content
-   `GET /api/verification/status/:tokenId`: Check verification status
-   `POST /api/verification/authorize`: Create brand authorization

### Registration API (Story Protocol)

-   `POST /api/registration/register`: Register IP Asset
-   `POST /api/registration/register-custom`: Custom IP Asset registration

### License API

-   `POST /api/licenses/mint`: Mint license
-   `POST /api/licenses/mint-one-time`: Mint one-time use license

### Royalty API

-   `POST /api/royalty/pay`: Pay royalties
-   `POST /api/royalty/claim`: Claim royalties
-   `POST /api/royalty/transfer`: Transfer royalty tokens

### Derivative API

-   `POST /api/derivative/commercial`: Register commercial derivative
-   `POST /api/derivative/non-commercial`: Register non-commercial derivative

### Dispute API

-   `POST /api/dispute`: File a dispute

## Usage Examples

### Verify and Register Music

To verify music with Yakoa and then register it with Story Protocol, use the following script:

```bash
bun run verify-and-register
```

This demonstrates the full flow from verification to registration.

### API Usage

You can use the API endpoints from your frontend application:

```typescript
// Example: Verify music
const response = await fetch('http://localhost:3000/api/verification/verify-music', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        creatorId: '0x1234...',
        title: 'My Song',
        description: 'An original composition',
        mediaItems: [
            {
                media_id: 'audio-1',
                url: 'https://example.com/music.mp3',
            },
            {
                media_id: 'image-1',
                url: 'https://example.com/cover.jpg',
            },
        ],
        transaction: {
            hash: '0x1234...',
            blockNumber: 12345,
            timestamp: 1687654321,
            chain: 'story',
        },
    }),
})

const data = await response.json()
console.log(data)
```

## Integration with Frontend

This backend is designed to be consumed by a Next.js frontend application. API endpoints provide all the necessary functionality for the Proof9 platform, including:

1. Music upload and verification
2. IP registration on Story Protocol
3. License management
4. Community features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC
