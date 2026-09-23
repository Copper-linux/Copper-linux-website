/* =====================================================================
   COPPER LINUX — optional GitHub token config
   ---------------------------------------------------------------------
   To use an authenticated GitHub API token (5000 requests/hour instead
   of 60):

   1. Copy this file to  js/gh-config.js   (it is gitignored, so your
      token never gets committed to the repository).
   2. Paste your personal access token below.

   Example token from GitHub:
     Settings -> Developer settings -> Personal access tokens ->
     Tokens (classic) -> Generate new token -> check "public_repo".

   If you leave GH_TOKEN empty, the site calls the GitHub API
   unauthenticated, which is fine for a low-traffic page.
   ===================================================================== */
var GH_TOKEN = '';