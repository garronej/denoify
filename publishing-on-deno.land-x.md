# 📤 Publishing on deno.land/x

Once you'll have successfully build your module for Deno you will want to publish it on [deno.land/x](https://deno.land/x)&#x20;

The easy way is to just git add the deno\_dist directory to your project, heads over to [deno.land/x](https://deno.land/x) and register your module specifying `deno_dist` as subdirectory

![deno\_registration](https://user-images.githubusercontent.com/6702424/117559462-c9571b00-b085-11eb-9ea5-683a0b0bb866.png)

{% hint style="warning" %}
deno.land/x doesn't allow the `-` character, if your module contain some, use `_` insted. &#x20;

Example: `foo-bar` -> `foo_bar`
{% endhint %}

### Avoiding tracking deno\_dist on the main branch

`deno_dist` is not source code. It shouldn't be tracked by git to avoid that we need a CI workflow that, when we release: &#x20;

* Create a `tmp_branch`
* Builds locally, there by creating the `deno_dist/` directory.
* Remove `/deno_dist` from the `.gitignore`
* Commit all `deno_dist/*` files (the commit exist only on the `tmp_branch`).
* Creates a new GitHub release targeting `tmp_branch`
* Release on NPM
* We remove the `tmp_branch`

You can copy paste to your project the [CI setup](https://github.com/garronej/tsafe/blob/main/.github/workflows/ci.yaml) of [tsafe](https://github.com/garronej/tsafe), it's fully portable and does just that. &#x20;

If you want more infos about this workflow you can follow [this PR](https://github.com/gvergnaud/ts-pattern/pull/108) where I set it up on the `ts-pattern` repo.

Do not hesitate [to open a discursion](https://github.com/garronej/denoify/discussions) if you need support issues.
