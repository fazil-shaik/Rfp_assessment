# AI-Powered RFP Management System

A streamlined, single-user web application for managing the Request for Proposal (RFP) process. This system leverages Google Gemini AI to parse natural language requirements, manage vendors, simulate email communications, and intelligently compare vendor proposals.

## Features

*   **AI-Driven RFP Creation**: Simply describe your procurement needs in plain English (e.g., "I need 20 laptops for the new office..."), and the system automatically structures it into a formal RFP.
*   **Vendor Management**: Maintain a database of vendors to easily select recipients for your RFPs.
*   **Email Integration**: 
    *   **Send RFPs**: Dispatch structured emails to selected vendors (uses Ethereal Email for safe testing).
    *   **Simulate Responses**: Paste raw email text from vendors, and the system uses AI to extract pricing, delivery dates, and terms automatically.
*   **Intelligent Comparison**: The system analyzes all vendor responses side-by-side using AI to provide a summary, scoring, and a final recommendation on who to award the contract to.
*   **Premium UI**: Built with a modern "Glassmorphism" aesthetic using Vanilla CSS and React.

## Tech Stack

*   **Frontend**: React (Vite), Vanilla CSS (Glassmorphism design)
*   **Backend**: Node.js, Express
*   **Database**: PostgreSQL (via Prisma ORM)
*   **AI**: Google Gemini (via `@google/generative-ai`)
*   **Email**: Nodemailer (configured with Ethereal for dev/testing)

## Prerequisites

*   **Node.js** (v18 or higher)
*   **PostgreSQL** (Running locally or via a cloud URL)
*   **Google Gemini API Key** (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd aerchainassessment
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

**Configuration**:
1.  Create a `.env` file in the `backend/` directory (you can copy `.env.local` if it exists).
2.  Add your Database URL and Gemini API Key:

```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/rfp_system?schema=public"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

**Database Migration**:
Push the schema to your PostgreSQL database:
```bash
npx prisma db push
```

**Start the Server**:
```bash
node index.js
```
*Server runs on `http://localhost:3000`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

**Start the UI**:
```bash
npm run dev
```
*UI runs on `http://localhost:5173` (check terminal for exact port)*

## Usage Guide

### 1. Create an RFP
1.  Go to the **Dashboard**.
2.  In the "Create New RFP" box, type requirements like:
    > "I need 50 ergonomic office chairs and 10 standing desks. Budget is $15,000. Need them delivered by next Friday."
3.  Click **Create RFP**.
4.  The system will extract structured data (Items, Budget, Timeline) and save the RFP.

### 2. Add Vendors
1.  Go to the **Vendors** tab.
2.  Add a few test vendors (e.g., "Office Depot", "Staples") with dummy email addresses.

### 3. Send RFP to Vendors
1.  Click **"View Details"** on your created RFP.
2.  On the right panel, select the vendors you want to invite.
3.  Click **"Send to Vendors"**.
4.  **Verification**: A "Preview URL" will appear below the button. Click it to view the simulated email sent via Ethereal.

### 4. Receive & Parse Responses
Since we don't have a real inbound mail server for localhost:
1.  In the RFP Details view, look for **"Simulate Incoming Email"** (bottom left).
2.  Select a Vendor.
3.  Paste a mock email response:
    > "Hi, we can supply the 50 chairs and desks for a total of $14,200. Delivery will be 2 days late, but we include a 3-year warranty."
4.  Click **"Receive Response"**.
5.  The AI will extract the price (`$14,200`), delivery info, and update the table above.

### 5. Compare Proposals
1.  Add at least 2 vendor responses using the simulation step above.
2.  Click **"Run AI Comparison"**.
3.  The system will evaluate the offers and display a **Recommendation**, **Summary**, and **Reasoning** (e.g., "Vendor A is recommended because they are under budget despite the late delivery").
