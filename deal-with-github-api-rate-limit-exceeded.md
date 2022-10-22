# 🆘 Deal with GitHub API rate limit exceeded

If you run Denoify a lot outside of GitHub Actions pipelines you will eventually get the following error:\
`RequestError [HttpError]: API rate limit exceeded for 176.170.197.165. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)`. To fix it, [create a GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and provide it as the environnement variable `GITHUB_TOKEN` when you run the build tool.

Example:

```bash
echo 'export GITHUB_TOKEN=ghp_xn8jsxZrUChs9nmfZPDSmxLrTJPVJy3Sxc5J' > ~/.bash_profile
source ~/.bash_profile
npx denoify
```
