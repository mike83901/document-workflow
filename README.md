# Example.com Document Approval

Document approval workspace built with Angular and ASP.NET Core. The API uses an in-memory mock store; decisions are kept for the lifetime of the API process.

## Requirements

- .NET 8 SDK
- Node.js 20.19+ or 22.12+

## Run locally

Start the API from the repository root:

```sh
dotnet run --project backend --launch-profile http
```

In another terminal, start the Angular app:

```sh
npm start --prefix frontend
```

Open <http://localhost:4200>. The Angular development proxy forwards `/api` requests to the API at <http://localhost:5288>. Swagger is available at <http://localhost:5288/swagger>.

## Workflow

- Filter the queue by pending, approved, and rejected status, or search by document details.
- Select a pending document and choose approve or reject.
- Enter a reason in the confirmation dialog. Cancel closes the dialog without changing the document.
- The API only accepts a decision once for each pending document.