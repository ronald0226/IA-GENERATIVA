<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b9f3a649-ec2f-401e-a2b2-6128b504aac5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The GitHub Actions workflow deploys the site automatically on every push to
`main`. In the repository settings, open **Pages** and set the build and
deployment source to **GitHub Actions**. The published site will be available at
`https://hinalador.github.io/akira-motors/`.

To enable Google Maps in the route calculator, add a repository Actions secret
named `VITE_GOOGLE_MAPS_API_KEY` under **Settings > Secrets and variables >
Actions**. Since this key is used by a public website, restrict it in Google
Cloud to the published site's HTTP referrer and the APIs the app uses.
