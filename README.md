# GUI for Cloudflare Vectorize

Application for managing and querying Cloudflare Vectorize indexes. Built with Tauri, Vanilla TypeScript, and Tailwind CSS.

## Features

- **Index Management**: Browse and manage your Cloudflare Vectorize indexes
- **Data Operations**: Random sampling, precise ID lookup, and semantic search
- **Embedding Support**: Text-to-vector conversion using @cf/baai/bge-m3
- **Bulk Operations**: Delete multiple vectors at once
- **Real-time Statistics**: View dimension and vector count information

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [Rust](https://rustup.rs/) (latest stable version)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gui-for-cloudflare-vectorize
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run tauri dev
```

This will launch the application in development mode with hot reloading enabled.

## Build

To build the application for production:

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

---

No Warranty: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

This app is is not associated with Cloudflare.
